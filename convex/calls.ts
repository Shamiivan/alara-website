import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createCall = mutation({
  args: {
    toNumber: v.string(),
    elevenLabsCallId: v.optional(v.string()),
    status: v.union(
      v.literal("initiated"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const callId = await ctx.db.insert("calls", {
      userId: user._id,
      toNumber: args.toNumber,
      status: args.status,
      elevenLabsCallId: args.elevenLabsCallId,
      initiatedAt: Date.now(),
      errorMessage: args.errorMessage,
    });

    return callId;
  },
});

export const getUserCalls = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return [];
    }

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    return calls;
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.callId, {
      status: args.status,
      duration: args.duration,
      completedAt: args.completedAt || Date.now(),
    });
  },
});