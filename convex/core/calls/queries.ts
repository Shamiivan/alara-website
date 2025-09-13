import { api } from "../../_generated/api";
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

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

// Public query for admin/debugging
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
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("wantsClarityCalls"), true))
      .collect();
  },
});

export type Call = {
  _id: Id<"calls">;
  _creationTime: number;
  userId: Id<"users">;
  purpose?: string;
  status: "initiated" | "in_progress" | "completed" | "failed" | "no_answer";
  elevenLabsCallId?: string;
  initiatedAt: number;
  errorMessage?: string;
  agentId?: string;
  conversationId?: string;
};

export const getUserCalls = query({
  args: {},
  handler: async (ctx): Promise<Call[] | null> => {
    const user = await ctx.runQuery(api.core.users.queries.getCurrentUser);
    if (!user) {
      return null;
    }

    return await ctx.db
      .query("calls")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc") // Most recent first
      .collect();
  },
});
