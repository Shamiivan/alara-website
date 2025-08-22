import { query, mutation, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const createCall = mutation({
  args: {
    toNumber: v.string(),
    agentId: v.string(),
    agentPhoneNumberId: v.string(),
    elevenLabsCallId: v.optional(v.string()),
    status: v.union(
      v.literal("initiated"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get the authenticated user ID directly
      const userId = await getAuthUserId(ctx);
      if (!userId) throw new Error("Not authenticated");

      // Create call record
      const callId = await ctx.db.insert("calls", {
        userId: userId,
        toNumber: args.toNumber,
        status: args.status || "initiated",
        agentId: args.agentId,
        agentPhoneNumberId: args.agentPhoneNumberId,
        elevenLabsCallId: args.elevenLabsCallId,
        initiatedAt: Date.now(),
        errorMessage: args.errorMessage,
      });

      return callId;
    } catch (error) {
      // Log error using the established pattern
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to create call: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          args,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      throw error;
    }
  },
});

export const getUserCalls = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Get the authenticated user ID
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return [];
      }

      // Get calls for the user
      const calls = await ctx.db
        .query("calls")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(args.limit || 50);

      return calls;
    } catch (error) {
      console.error("[getUserCalls] Error:", error);
      return [];
    }
  },
});

export const updateCallStatus = mutation({
  args: {
    callId: v.id("calls"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("no_answer")
    ),
    duration: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.callId, {
        status: args.status,
        duration: args.duration,
        completedAt: args.completedAt || Date.now(),
        errorMessage: args.errorMessage,
      });

      return { success: true };
    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to update call status: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          callId: args.callId,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      throw error;
    }
  },
});

// Helper function to get a call by ID
export const getCall = query({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    try {
      // Get the authenticated user ID
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return null;
      }

      // Get the call
      const call = await ctx.db.get(args.callId);

      // Verify the call belongs to the user
      if (!call || call.userId !== userId) {
        return null;
      }

      return call;
    } catch (error) {
      console.error("[getCall] Error:", error);
      return null;
    }
  },
});

// Update call with ElevenLabs response
export const updateCallWithElevenLabsResponse = mutation({
  args: {
    callId: v.id("calls"),
    purpose: v.optional(v.string()),
    elevenLabsCallId: v.string(),
    conversationId: v.string(),
    twilioCallSid: v.string(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get the call to verify it exists
      const call = await ctx.db.get(args.callId);
      if (!call) {
        throw new Error("Call not found");
      }

      // Update the call with ElevenLabs response
      await ctx.db.patch(args.callId, {
        purpose: args.purpose || "unknown",
        elevenLabsCallId: args.elevenLabsCallId,
        conversationId: args.conversationId,
        twilioCallSid: args.twilioCallSid,
        status: args.success ? "in_progress" : "failed",
        errorMessage: args.errorMessage,
      });

      return { success: true };
    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to update call with ElevenLabs response: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          callId: args.callId,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      throw error;
    }
  },
});

// Store conversation transcript
export const storeConversation = mutation({
  args: {
    callId: v.optional(v.id("calls")),
    userId: v.optional(v.id("users")),
    conversationId: v.string(),
    transcript: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      timeInCallSecs: v.number(),
      message: v.string(),
    })),
    metadata: v.object({
      startTimeUnixSecs: v.number(),
      callDurationSecs: v.number(),
    }),
    hasAudio: v.boolean(),
    hasUserAudio: v.boolean(),
    hasResponseAudio: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the authenticated user ID

      // Insert conversation record
      const conversationId = await ctx.db.insert("conversations", {
        callId: args.callId,
        userId: args.userId,
        conversationId: args.conversationId,
        transcript: args.transcript,
        metadata: args.metadata,
        hasAudio: args.hasAudio,
        hasUserAudio: args.hasUserAudio,
        hasResponseAudio: args.hasResponseAudio,
        createdAt: Date.now(),
      });

      return { success: true, conversationId };
    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to store conversation: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          callId: args.callId,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      throw error;
    }
  },
});



export const getCallByElevenLabsCallId = internalQuery({
  args: {
    elevenLabsCallId: v.string(),
  },
  handler: async (ctx, { elevenLabsCallId }) => {
    try {
      // Get the call from the database
      const call = await ctx.db
        .query("calls")
        .withIndex("by_eleven_labs_call_id", (q) => q.eq("elevenLabsCallId", elevenLabsCallId))
        .unique();

      return call;
    } catch (error) {
      console.error("[getCallByElevenLabsCallId] Error:", error);
      return null;
    }
  },
});

// The initiateCall action has been moved to calls_node.ts to use the Node.js runtime

// Action to fetch conversation data from ElevenLabs API
// This is a wrapper around the Node.js implementation in calls_node.ts
export const fetchElevenLabsConversation = action({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    try {
      // Call the Node.js implementation
      return await ctx.runAction(api.calls_node.fetchElevenLabsConversation, {
        callId: args.callId,
      });
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

      throw error;
    }
  },
});