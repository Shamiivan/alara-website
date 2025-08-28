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