// conversations.ts
import { query } from "./../../_generated/server";
import { v } from "convex/values";

/**
 * Get a single conversation by its ID
 */
export const get = query({
  args: { id: v.id("conversations") },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      callId: v.optional(v.id("calls")),
      elevenLabsCallId: v.optional(v.string()),
      userId: v.optional(v.id("users")),
      conversationId: v.string(),
      transcript: v.array(v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        timeInCallSecs: v.number(),
        message: v.string(),
      })),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get conversation by call ID
 */
export const getByCallId = query({
  args: { callId: v.id("calls") },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      callId: v.optional(v.id("calls")),
      elevenLabsCallId: v.optional(v.string()),
      userId: v.optional(v.id("users")),
      conversationId: v.string(),
      transcript: v.array(v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        timeInCallSecs: v.number(),
        message: v.string(),
      })),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_call", (q) => q.eq("callId", args.callId))
      .unique();
  },
});

/**
 * Get conversation by ElevenLabs call ID
 */
export const getByElevenLabsCallId = query({
  args: { elevenLabsCallId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      callId: v.optional(v.id("calls")),
      elevenLabsCallId: v.optional(v.string()),
      userId: v.optional(v.id("users")),
      conversationId: v.string(),
      transcript: v.array(v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        timeInCallSecs: v.number(),
        message: v.string(),
      })),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_eleven_labs_call_id", (q) => q.eq("elevenLabsCallId", args.elevenLabsCallId))
      .unique();
  },
});

/**
 * List conversations for a user (most recent first)
 */
export const listByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    _id: v.id("conversations"),
    _creationTime: v.number(),
    callId: v.optional(v.id("calls")),
    elevenLabsCallId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    conversationId: v.string(),
    transcript: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      timeInCallSecs: v.number(),
      message: v.string(),
    })),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * List all conversations (admin view, most recent first)
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id("conversations"),
    _creationTime: v.number(),
    callId: v.optional(v.id("calls")),
    elevenLabsCallId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    conversationId: v.string(),
    transcript: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      timeInCallSecs: v.number(),
      message: v.string(),
    })),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("conversations")
      .order("desc")
      .take(limit);
  },
});

/**
 * Count conversations for a user
 */
export const countByUser = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return conversations.length;
  },
});