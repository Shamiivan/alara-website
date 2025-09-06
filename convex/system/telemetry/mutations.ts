import { mutation, query, internalMutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Track a telemetry event for a user
 */
export const createLog = mutation({
  args: {
    userId: v.id("users"),
    event: v.string(),
    context: v.optional(v.any()),
    error: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("telemetry", {
      userId: args.userId,
      event: args.event,
      context: args.context,
      error: args.error,
      createdAt: Date.now(),
    });
    return null;
  },
});
