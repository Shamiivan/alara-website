import { query, mutation, action } from "./_generated/server";
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

      // For testing purposes, create a test user if not authenticated
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        // Look for a test user or create one
        const testUsers = await ctx.db
          .query("users")
          .filter(q => q.eq(q.field("name"), "Test User"))
          .collect();

        if (testUsers.length > 0) {
          effectiveUserId = testUsers[0]._id;
        } else {
          // Create a test user
          effectiveUserId = await ctx.db.insert("users", {
            name: "Test User",
            email: "test@example.com",
          });
        }
      }

      // Create call record
      const callId = await ctx.db.insert("calls", {
        userId: effectiveUserId,
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
    callId: v.id("calls"),
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
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Verify the call belongs to the user
      const call = await ctx.db.get(args.callId);
      if (!call || call.userId !== userId) {
        throw new Error("Call not found or not authorized");
      }

      // Insert conversation record
      const conversationId = await ctx.db.insert("conversations", {
        callId: args.callId,
        userId: userId,
        conversationId: args.conversationId,
        transcript: args.transcript,
        metadata: args.metadata,
        hasAudio: args.hasAudio,
        hasUserAudio: args.hasUserAudio,
        hasResponseAudio: args.hasResponseAudio,
        createdAt: Date.now(),
      });

      // Update call record with hasTranscript flag and final status/duration
      await ctx.db.patch(args.callId, {
        hasTranscript: true,
        status: "completed",
        duration: args.metadata.callDurationSecs,
        completedAt: Date.now(),
        startTimeUnix: args.metadata.startTimeUnixSecs,
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

// Get conversation by call ID
export const getConversationByCallId = query({
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

      // Verify the call belongs to the user
      const call = await ctx.db.get(args.callId);
      if (!call || call.userId !== userId) {
        return null;
      }

      // Get the conversation
      const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_call", (q) => q.eq("callId", args.callId))
        .unique();

      return conversation;
    } catch (error) {
      console.error("[getConversationByCallId] Error:", error);
      return null;
    }
  },
});

// Get all user conversations
export const getUserConversations = query({
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

      // Get conversations for the user
      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(args.limit || 20);

      // Get the associated calls for each conversation
      const callIds = conversations.map(conv => conv.callId);
      const calls = await Promise.all(
        callIds.map(callId => ctx.db.get(callId))
      );

      // Combine conversations with call details
      return conversations.map((conv, index) => ({
        ...conv,
        call: calls[index],
      }));
    } catch (error) {
      console.error("[getUserConversations] Error:", error);
      return [];
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