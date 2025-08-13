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

      // Make API call to ElevenLabs to initiate the call
      const result = await elevenLabs.conversationalAi.twilio.outboundCall({
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        toNumber: args.toNumber
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