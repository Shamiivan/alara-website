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

export const latest = query({
  args: {
    limit: v.optional(v.number()),
    event: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async ({ db }, args) => {
    const { limit = 100, event, userId } = args;
    let query = db.query("telemetry");

    if (event) {
      query = query.filter(q => q.eq(q.field("event"), event));
    }

    if (userId) {
      query = query.filter(q => q.eq(q.field("userId"), userId));
    }

    return query
      .order("desc")
      .take(Math.min(limit, 200)); // Allow up to 200 for admin views
  },
});

export const getCountsByEvent = query({
  args: {
    events: v.array(v.string()),
    hours: v.optional(v.number()),
  },
  handler: async ({ db }, { events, hours = 24 }) => {
    const now = Date.now();
    const timeThreshold = now - hours * 60 * 60 * 1000;

    const counts: Record<string, number> = {};

    // Get counts for each event type
    for (const event of events) {
      const results = await db.query("telemetry")
        .filter(q => q.eq(q.field("event"), event))
        .filter(q => q.gte(q.field("createdAt"), timeThreshold))
        .collect();

      counts[event] = results.length;
    }

    return counts;
  },
});

export const getUserEvents = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { userId, limit = 100 }) => {
    return db.query("telemetry")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(Math.min(limit, 200)); // Allow up to 200 for admin views
  },
});

