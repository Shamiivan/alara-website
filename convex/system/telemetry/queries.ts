import { mutation, query, internalMutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Get telemetry events for a user with optional time range
 */
export const getUserEvents = query({
  args: {
    userId: v.id("users"),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("telemetry"),
    userId: v.id("users"),
    event: v.string(),
    context: v.optional(v.any()),
    error: v.optional(v.any()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("telemetry")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.startTime) {
      query = query.filter((q) => q.gte(q.field("createdAt"), args.startTime!));
    }
    if (args.endTime) {
      query = query.filter((q) => q.lte(q.field("createdAt"), args.endTime!));
    }

    return await query
      .order("desc")
      .take(args.limit ?? 100);
  },
});

/**
 * Get events by type with time range for analytics
 */
export const getEventsByType = query({
  args: {
    event: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("telemetry"),
    userId: v.id("users"),
    event: v.string(),
    context: v.optional(v.any()),
    error: v.optional(v.any()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("telemetry")
      .withIndex("by_event_time");

    if (args.startTime) {
      query = query.filter((q) => q.gte(q.field("createdAt"), args.startTime!));
    }
    if (args.endTime) {
      query = query.filter((q) => q.lte(q.field("createdAt"), args.endTime!));
    }

    return await query
      .filter((q) => q.eq(q.field("event"), args.event))
      .order("desc")
      .take(args.limit ?? 100);
  },
});

/**
 * Get recent events across all users for monitoring
 */
export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("telemetry"),
    userId: v.id("users"),
    event: v.string(),
    context: v.optional(v.any()),
    error: v.optional(v.any()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telemetry")
      .withIndex("by_event_time")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

/**
 * Get error events for debugging
 */
export const getErrors = query({
  args: {
    startTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("telemetry"),
    userId: v.id("users"),
    event: v.string(),
    context: v.optional(v.any()),
    error: v.optional(v.any()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("telemetry")
      .withIndex("by_event_time");

    if (args.startTime) {
      query = query.filter((q) => q.gte(q.field("createdAt"), args.startTime!));
    }

    return await query
      .filter((q) => q.neq(q.field("error"), undefined))
      .order("desc")
      .take(args.limit ?? 100);
  },
});