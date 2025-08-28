// This file contains Node.js-specific actions that require the Node.js runtime
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Id } from "./_generated/dataModel";
import { any } from "@elevenlabs/elevenlabs-js/core/schemas";
import { createToolCallExtractor } from "./utils/extractor";
import { user } from "@elevenlabs/elevenlabs-js/api";

// Define return type for initiateCall
interface InitiateCallResult {
  success: boolean;
  callId: Id<"calls">;
  elevenLabsCallId: string;
  conversationId: string;
  message: string;
}

// Action to initiate a call via ElevenLabs API
export const initiateCall = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    userName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<InitiateCallResult> => {
    try {
      const agentId = process.env.ELEVEN_LABS_AGENT_ID!;
      if (!agentId) throw new Error("Missing ELEVEN_LABS_AGENT_ID environment variable");

      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;
      if (!agentId) throw new Error("Missing ELEVEN_LABS_PHONE_NUMBER_ID environment variable");
      const apiKey = process.env.ELEVEN_LABS_API_KEY!;
      if (!apiKey) throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");

      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // build the arguments (username and )
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "There",
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

      if (!result.callSid) throw new Error("Failed to get callSid from ElevenLabs");

      // Create a call record in the database
      const dbCallId: Id<"calls"> = await ctx.runMutation(api.calls.createCall, {
        userId: args.userId,
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

      // Return success response with call details
      return {
        success: true,
        callId: dbCallId,
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        message: "Call initiated successfully"
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

      // Return error response with proper typing
      return {
        success: false,
        callId: "" as Id<"calls">, // Empty ID as placeholder
        elevenLabsCallId: "",
        conversationId: "",
        message: error instanceof Error ? error.message : String(error)
      };
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

export const initiateReminderCall = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    userName: v.optional(v.string()),
    taskName: v.optional(v.string()),
    taskTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    taskID: v.id("tasks")
  },
  handler: async (ctx, args) => {
    try {
      const id = args.taskID;
      // get the task 
      // const task = args.taskID ? await ctx.runQuery(api.tasks.getTaskById, { taskId: args.taskID }) : null;
      const task = await ctx.runQuery(api.tasks.getTaskById, { taskId: id });

      if (!task) throw new Error(`Task with ID ${args.taskID} not found`);

      const agentId = process.env.ELEVEN_LABS_REMINDER_AGENT_ID!;
      console.error("Please set the ELEVEN_LABS_PHONE_NUMBER_ID environment variable")
      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;

      const apiKey = process.env.ELEVEN_LABS_API_KEY!;

      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // build the arguments (username and )
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "",
        user_timezone: args.timezone || "America/Toronto",
        task_name: args.taskName || "",
        task_time: args.taskTime || "",
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
        userId: args.userId,
        toNumber: args.toNumber,
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        elevenLabsCallId: result.callSid,
        status: "initiated"
      });

      // Update the call with ElevenLabs response data
      await ctx.runMutation(api.calls.updateCallWithElevenLabsResponse, {
        callId: dbCallId,
        purpose: "reminder",
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        twilioCallSid: result.callSid,
        success: true
      });

      // // Wait a short time for the call to be established before fetching the conversation
      // // This is a temporary solution - in a production environment, we should use webhooks
      // // or a polling mechanism to determine when the call is complete
      // setTimeout(async () => {
      //   try {
      //     if (result.conversationId) {
      //       // Fetch and store the conversation data
      //       await ctx.runAction(api.calls_node.fetchElevenLabsConversation, {
      //         callId: dbCallId
      //       });
      //     }
      //   } catch (error) {
      //     console.error("Error fetching conversation after call:", error);
      //   }
      // }, 5000);

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
export const handleElevenLabsWebhookTemp = action({
  args: {
    payload: v.any()
  },
  handler: async (ctx, { payload }) => {
    try {
      const conversationData = payload;
      const callId = payload.metadata.phone_call.call_sid;

      const callRow = await ctx.runQuery(internal.calls.getCallByElevenLabsCallId, {
        elevenLabsCallId: callId
      });
      // get the call from eleven lab
      if (!callRow) {
        console.error("Call not found for ElevenLabs call ID:", callId);
        throw new Error("Call not found");
      }

      console.log("Conversation data fetched successfully");
      console.log("Transcript length:", conversationData.transcript.length);

      // Add detailed logging of the transcript data structure
      console.log("ElevenLabs transcript structure:", JSON.stringify(conversationData.transcript, null, 2));
      console.log("First transcript item role:", conversationData.transcript?.[0]?.role);

      // Process the conversation data
      let processedTranscript = conversationData.transcript
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


      console.log("Processed transcript:", JSON.stringify(processedTranscript, null, 2));
      const conversation = {
        conversationId: conversationData.conversation_id,
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
        callId: callRow._id,
        userId: callRow.userId ? callRow.userId : undefined,
        conversationId: conversation.conversationId,
        transcript: conversation.transcript,
        metadata: conversation.metadata,
        hasAudio: conversation.hasAudio,
        hasUserAudio: conversation.hasUserAudio,
        hasResponseAudio: conversation.hasResponseAudio,
      });
      // inside handleElevenLabsWebhookTemp.handler right where you build processedTranscript
      const defaultTz =
        conversationData?.conversation_initiation_client_data?.dynamic_variables?.user_timezone ??
        conversationData?.metadata?.timezone ??
        "UTC";

      processedTranscript = (conversationData.transcript ?? [])
        .filter((item: any) => {
          if (!item) return false;
          if (item.message) return true;
          // also keep rows that have tool_calls/results even if message is null
          if ((item.tool_calls && item.tool_calls.length) || (item.tool_results && item.tool_results.length)) return true;
          return false;
        })
        .map((item: any) => {
          // role mapping
          let validRole: "user" | "assistant";
          if (item.role === "agent") validRole = "assistant";
          else if (item.role === "user") validRole = "user";
          else validRole = "assistant";
        });
      if (!callId) throw new Error("Call ID is required, can not create tasks");
      if (!callRow.userId) throw new Error("User ID is required, can not create tasks");

      const getCreateTaskResults = createToolCallExtractor('create_task');
      const toolCalls = getCreateTaskResults(conversationData.transcript);

      for (const toolCall of toolCalls) {
        console.log("User Id");
        await ctx.runMutation(api.tasks.create_task, {
          title: toolCall.parsedParams.title,
          due: toolCall.parsedParams.due,
          timezone: defaultTz,
          source: "call",
          userId: callRow.userId,
          reminderMinutesBefore: 5,
          callId: callRow._id,
        });
      }


    } catch (error) {
      // Log error
      console.error("Error fetching conversation from ElevenLabs:", error);
      throw error;
    }
  },
});

interface InitiateCallWithCalendarResult extends InitiateCallResult {
  calendarSummary?: {
    freeSlots: number;
    busyPeriods: number;
    longestFreeSlot: number;
  };
}

// Action to initiate a call with calendar availability data
export const initiateCallWithCalendarData = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    calendarId: v.string(),
    userName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<InitiateCallResult> => {
    try {
      // Environment variables validation
      const agentId = process.env.ELEVEN_LABS_AGENT_ID!;
      if (!agentId) throw new Error("Missing ELEVEN_LABS_AGENT_ID environment variable");

      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;
      if (!agentPhoneNumberId) throw new Error("Missing ELEVEN_LABS_PHONE_NUMBER_ID environment variable");

      const apiKey = process.env.ELEVEN_LABS_API_KEY!;
      if (!apiKey) throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch calendar data for today
      const calendarData = await ctx.runAction(api.calendar.getCalendarEventsWithAvailability, {
        userId: args.userId,
        calendarId: args.calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        timezone: args.timezone || "America/Toronto",
      });

      if (!calendarData.success || !calendarData.data) {
        throw new Error("Failed to fetch calendar data");
      }

      // Extract today's free and busy slots
      const todayFreeSlots = calendarData.data.freeSlots.map(slot => ({
        start: slot.start,
        end: slot.end,
        durationMinutes: slot.durationMinutes,
        isBusinessHours: slot.isBusinessHours || false,
      }));

      const todayBusySlots = calendarData.data.busyPeriods.map(busy => ({
        summary: busy.summary,
        start: busy.start,
        end: busy.end,
        isAllDay: busy.isAllDay,
        location: busy.location || null,
      }));

      // Initialize ElevenLabs client
      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // Build dynamic variables with calendar data
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "There",
        user_timezone: args.timezone || "America/Toronto",
        calendar_connected: "true",
        today_free_slots: JSON.stringify(todayFreeSlots),
        today_busy_slots: JSON.stringify(todayBusySlots),
        total_free_slots: todayFreeSlots.length.toString(),
        total_busy_periods: todayBusySlots.length.toString(),
        longest_free_slot: Math.max(...todayFreeSlots.map(slot => slot.durationMinutes), 0).toString(),
      };

      // Log calendar data for debugging
      console.log(`Calendar data for call initiation:`, {
        freeSlots: todayFreeSlots.length,
        busySlots: todayBusySlots.length,
        userId: args.userId,
        calendarId: args.calendarId,
      });

      // Make API call to ElevenLabs to initiate the call
      const result = await elevenLabs.conversationalAi.twilio.outboundCall({
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        toNumber: args.toNumber,
        conversationInitiationClientData: {
          dynamicVariables: dynamicVariables,
        }
      });

      if (!result.callSid) throw new Error("Failed to get callSid from ElevenLabs");

      // Create a call record in the database
      const dbCallId: Id<"calls"> = await ctx.runMutation(api.calls.createCall, {
        userId: args.userId,
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

      // Return success response with call details and calendar summary
      return {
        success: true,
        callId: dbCallId,
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        message: `Call initiated successfully with calendar data - ${todayFreeSlots.length} free slots, ${todayBusySlots.length} busy periods`,
      };

    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to initiate ElevenLabs call with calendar data: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          toNumber: args.toNumber,
          calendarId: args.calendarId,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      console.log("Error in initiateCallWithCalendarData:", error);

      // Return error response
      return {
        success: false,
        callId: "" as Id<"calls">,
        elevenLabsCallId: "",
        conversationId: "",
        message: error instanceof Error ? error.message : String(error)
      };
    }
  },
});
