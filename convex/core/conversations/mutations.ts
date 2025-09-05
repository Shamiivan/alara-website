// conversations.ts (mutations)
import { mutation } from "./../../_generated/server";
import { v } from "convex/values";

/**
 * Create a new conversation
 */
export const create = mutation({
  args: {
    callId: v.optional(v.id("calls")),
    elevenLabsCallId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    conversationId: v.string(),
    transcript: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      timeInCallSecs: v.number(),
      message: v.string(),
    }))),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("conversations", {
      callId: args.callId,
      elevenLabsCallId: args.elevenLabsCallId,
      userId: args.userId,
      conversationId: args.conversationId,
      transcript: args.transcript ?? [],
      createdAt: now,
    });
  },
});

/**
 * Update transcript (replace entire transcript)
 */
export const updateTranscript = mutation({
  args: {
    id: v.id("conversations"),
    transcript: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      timeInCallSecs: v.number(),
      message: v.string(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      transcript: args.transcript,
    });
    return null;
  },
});

/**
 * Add message to transcript
 */
export const addMessage = mutation({
  args: {
    id: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    timeInCallSecs: v.number(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const newMessage = {
      role: args.role,
      timeInCallSecs: args.timeInCallSecs,
      message: args.message,
    };

    await ctx.db.patch(args.id, {
      transcript: [...conversation.transcript, newMessage],
    });
    return null;
  },
});

/**
 * Link conversation to call
 */
export const linkToCall = mutation({
  args: {
    id: v.id("conversations"),
    callId: v.id("calls"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      callId: args.callId,
    });
    return null;
  },
});

/**
 * Link conversation to user
 */
export const linkToUser = mutation({
  args: {
    id: v.id("conversations"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      userId: args.userId,
    });
    return null;
  },
});

/**
 * Update ElevenLabs call ID
 */
export const updateElevenLabsCallId = mutation({
  args: {
    id: v.id("conversations"),
    elevenLabsCallId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      elevenLabsCallId: args.elevenLabsCallId,
    });
    return null;
  },
});

/**
 * Delete conversation
 */
export const remove = mutation({
  args: { id: v.id("conversations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});