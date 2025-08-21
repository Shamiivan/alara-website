import { mutation, query } from "./_generated/server"
import { v } from "convex/values";


export const createLog = mutation({
  args: {
    userId: v.id("users"),
    event: v.string(),
    context: v.optional(v.any()), // JSON object with additional context
    error: v.optional(v.any()), // Optional error object
  },
  handler: async ({ db }, { userId, event, context, error }) => {
    return await db.insert("telemetry", {
      userId,
      event,
      context,
      error,
      createdAt: Date.now(),
    });
  },
});


export const getLatestLogs = query({
  args: {
    limit: v.number(),
  },
  handler: async ({ db }, { limit }) => {
    return db.query("telemetry")
      .order("desc")
      .take(Math.min(limit, 100)) // Limit to 100 for performance;
  },
});

export const getLogsByEvent = query({
  args: {
    event: v.string(),
    limit: v.number(),
  },
  handler: async ({ db }, { event, limit }) => {
    return db.query("telemetry")
      .filter(q => q.eq("event", event))
      .order("desc")
      .take(Math.min(limit, 100));
  },
});

