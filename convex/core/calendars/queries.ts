// core/calendar/queries.ts
import { v } from "convex/values";
import { internalQuery, query } from "../../_generated/server";


export const isCalendarConnected = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const account = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (account?.refreshToken && account?.accessToken && account?.expiresAtMs > Date.now()) {
      return { connected: true, email: account.userEmail };
    }
    return { connected: false, email: null };
  },
});