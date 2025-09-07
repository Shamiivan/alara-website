// core/calendar/queries.ts
import { refreshAccessToken } from "../../integrations/google/auth";
import { v } from "convex/values";
import { internalQuery, internalMutation, internalAction, query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";


export const getTokenByEmail = internalQuery({
  args: {
    email: v.string()
  },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("googleTokens")
      .withIndex("by_email", (q) => q.eq("userEmail", email))
      .unique();
  },
});


export const getTokenByUserId = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});
