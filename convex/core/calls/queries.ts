import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getCallById = query({
  args: { callId: v.id("calls") },
  handler: async (ctx, { callId }) => ctx.db.get(callId),
});

// Fetch a call by ElevenLabs call id (webhook join)
export const getCallByElevenLabsId = query({
  args: { elevenLabsCallId: v.string() },
  handler: async (ctx, { elevenLabsCallId }) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_eleven_labs_call_id", q => q.eq("elevenLabsCallId", elevenLabsCallId))
      .unique();
  },
});

export const getUsersForDailyCalls = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("users"),
    name: v.optional(v.string()),
    callTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    wantsClarityCalls: v.optional(v.boolean()),
    mainCalendarId: v.optional(v.string()),
    phone: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    // Public query for admin/debugging
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("wantsClarityCalls"), true))
      .collect();
  },
});