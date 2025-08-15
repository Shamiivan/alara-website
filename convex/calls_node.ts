// This file contains Node.js-specific actions that require the Node.js runtime
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Action to initiate a call via ElevenLabs API
export const initiateCall = action({
  args: {
    toNumber: v.string(),
    userName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    callId: string;
    message: string;
  }> => {
    try {
      const agentId = process.env.ELEVEN_LABS_AGENT_ID!;
      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;
      console.log("AGENT", agentId);

      const apiKey = process.env.ELEVEN_LABS_API_KEY!;

      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // build the arguments (username and )
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "",
        user_timezone: args.timezone || "America/Toronto",
      }
      // Make API call to ElevenLabs to initiate the call
      const result = await elevenLabs.conversationalAi.twilio.outboundCall({
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        toNumber: args.toNumber,
        conversationInitiationClientData: {
          dynamicVariables: dynamicVariables,
        }
      });

      if (!result.callSid) {
        throw new Error("Failed to get callSid from ElevenLabs");
      }

      // Create a call record in the database
      const dbCallId = await ctx.runMutation(api.calls.createCall, {
        toNumber: args.toNumber,
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        elevenLabsCallId: result.callSid,
        status: "initiated"
      });

      // Update the call with ElevenLabs response data
      await ctx.runMutation(api.calls.updateCallWithElevenLabsResponse, {
        callId: dbCallId,
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        twilioCallSid: result.callSid,
        success: true
      });

      // Wait a short time for the call to be established before fetching the conversation
      // This is a temporary solution - in a production environment, you might use webhooks
      // or a polling mechanism to determine when the call is complete
      setTimeout(async () => {
        try {
          if (result.conversationId) {
            // Fetch and store the conversation data
            await ctx.runAction(api.calls_node.fetchElevenLabsConversation, {
              callId: dbCallId
            });
          }
        } catch (error) {
          console.error("Error fetching conversation after call:", error);
        }
      }, 5000); // Wait 5 seconds before fetching - adjust as needed

      return {
        success: true,
        callId: result.callSid,
        message: `Call initiated successfully to ${args.userName || 'user'} at ${args.toNumber}`
      };
    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to initiate ElevenLabs call: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          toNumber: args.toNumber,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      // Log the error for debugging
      console.log("Error in initiateCall:", error);

      // We don't need to update call status here since we don't have a callId
      // if there was an error before creating the call

      throw error;
    }
  },
});

// Action to fetch conversation data from ElevenLabs API
export const fetchElevenLabsConversation = action({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    try {
      // Get the call details
      const call = await ctx.runQuery(api.calls.getCall, {
        callId: args.callId,
      });

      if (!call || !call.conversationId) {
        throw new Error("Call not found or missing conversation ID");
      }

      // Initialize ElevenLabs client
      const apiKey = process.env.ELEVEN_LABS_API_KEY!;
      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      console.log("Fetching conversation from ElevenLabs:", call.conversationId);

      // Fetch conversation data from ElevenLabs API
      const conversationData = await elevenLabs.conversationalAi.conversations.get(call.conversationId);

      // Validate that we have transcript data
      if (!conversationData || !Array.isArray(conversationData.transcript)) {
        console.error("Invalid conversation data from ElevenLabs:", conversationData);
        throw new Error("Invalid conversation data: missing or invalid transcript array");
      }

      console.log("Conversation data fetched successfully");
      console.log("Transcript length:", conversationData.transcript.length);

      // Add detailed logging of the transcript data structure
      console.log("ElevenLabs transcript structure:", JSON.stringify(conversationData.transcript, null, 2));
      console.log("First transcript item role:", conversationData.transcript?.[0]?.role);

      // Process the conversation data
      let processedTranscript;
      try {
        processedTranscript = conversationData.transcript
          // Filter out items that don't have a message or are just tool calls/results
          .filter((item: any) => {
            // Skip null or undefined items
            if (!item) {
              console.log("Filtering out null/undefined transcript item");
              return false;
            }

            // Keep items that have a message
            if (item.message) return true;

            // Log items we're filtering out for debugging
            console.log("Filtering out transcript item without message:", JSON.stringify(item));
            return false;
          })
          .map((item: any) => {
            // Validate and convert role to the expected type
            let validRole: "user" | "assistant";
            if (item.role === "agent") {
              validRole = "assistant";
            } else if (item.role === "user") {
              validRole = "user";
            } else {
              console.log(`Unknown role "${item.role}" found, defaulting to "assistant"`);
              validRole = "assistant";
            }

            return {
              role: validRole,
              timeInCallSecs: item.timeInCallSecs || 0,
              message: item.message || "",
            };
          });
      } catch (error) {
        console.error("Error processing transcript:", error);
        throw new Error(`Failed to process transcript: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Ensure we have at least one transcript item
      if (!processedTranscript || processedTranscript.length === 0) {
        console.warn("No valid transcript items found after processing");
        // Create a properly typed fallback transcript
        processedTranscript = [{
          role: "assistant" as const,
          timeInCallSecs: 0,
          message: "No transcript available"
        }];
      }

      const conversation = {
        conversationId: call.conversationId,
        transcript: processedTranscript,
        metadata: {
          startTimeUnixSecs: conversationData.metadata?.startTimeUnixSecs || Math.floor(Date.now() / 1000),
          callDurationSecs: conversationData.metadata?.callDurationSecs || 0,
        },
        hasAudio: conversationData.hasAudio || false,
        hasUserAudio: conversationData.hasUserAudio || false,
        hasResponseAudio: conversationData.hasResponseAudio || false,
      };

      console.log("Successfully fetched conversation from ElevenLabs");

      // Store the conversation in the database
      await ctx.runMutation(api.calls.storeConversation, {
        callId: args.callId,
        conversationId: conversation.conversationId,
        transcript: conversation.transcript,
        metadata: conversation.metadata,
        hasAudio: conversation.hasAudio,
        hasUserAudio: conversation.hasUserAudio,
        hasResponseAudio: conversation.hasResponseAudio,
      });

      // Extract and register tasks from the conversation
      await ctx.runMutation(api.tasks.registerFromConversation, {
        callId: args.callId,
        userId: call.userId,
        messages: conversationData.transcript || [],
      });

      return { success: true };
    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to fetch ElevenLabs conversation: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          callId: args.callId,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      console.error("Error fetching conversation from ElevenLabs:", error);
      throw error;
    }
  },
});