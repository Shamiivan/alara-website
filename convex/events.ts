import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Log an error event to the database
export const logError = mutation({
  args: {
    category: v.string(), // "auth", "onboarding", "payment", "calls", "api", "system"
    message: v.string(),
    details: v.optional(v.any()),
    url: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    source: v.string(), // "client", "server", "middleware", "api", "convex"
    showToUser: v.optional(v.boolean()),
    userMessage: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user ID if authenticated (optional for errors)
    let userId;
    try {
      userId = await getAuthUserId(ctx);
    } catch {
      // User might not be authenticated, which is fine for error logging
      userId = undefined;
    }

    // Insert error event
    const eventId = await ctx.db.insert("events", {
      category: args.category,
      type: "error" as const,
      message: args.message,
      details: args.details,
      userId: userId || undefined,
      sessionId: args.sessionId,
      url: args.url,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      source: args.source,
      showToUser: args.showToUser,
      userMessage: args.userMessage,
      resolved: false,
    });

    return eventId;
  },
});

// Get error events for a user (authenticated)
export const getUserErrors = query({
  args: {
    limit: v.optional(v.number()),
    resolved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.resolved !== undefined) {
      query = query.filter((q) => q.eq(q.field("resolved"), args.resolved));
    }

    return await query
      .order("desc")
      .take(args.limit || 50);
  },
});

// Get all errors (for admin/debugging - no auth required for now)
export const getAllErrors = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("events").withIndex("by_timestamp");

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// Mark an error as resolved
export const markErrorResolved = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the event to check ownership
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Only allow users to resolve their own errors (or skip check for system errors)
    if (event.userId && event.userId !== userId) {
      throw new Error("Not authorized to resolve this error");
    }

    await ctx.db.patch(args.eventId, {
      resolved: true,
    });

    return { success: true };
  },
});

// Get unresolved errors for a user
export const getUnresolvedErrors = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_user_unresolved", (q) =>
        q.eq("userId", userId).eq("resolved", false)
      )
      .order("desc")
      .take(args.limit || 10);
  },
});

// Internal mutation for logging errors from server-side code
export const logErrorInternal = mutation({
  args: {
    category: v.string(),
    message: v.string(),
    details: v.optional(v.any()),
    userId: v.optional(v.id("users")),
    url: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    source: v.string(),
    showToUser: v.optional(v.boolean()),
    userMessage: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      category: args.category,
      type: "error" as const,
      message: args.message,
      details: args.details,
      userId: args.userId,
      sessionId: args.sessionId,
      url: args.url,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      source: args.source,
      showToUser: args.showToUser,
      userMessage: args.userMessage,
      resolved: false,
    });

    return eventId;
  },
});