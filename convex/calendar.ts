import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";



export const upsertTokens = mutation({
  args: {
    userId: v.id("users"),
    userEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAtMs: v.number(),
  },
  async handler(ctx, args_0) {
    try {
      const existing = await ctx.db.query("googleTokens")
        .withIndex("by_user", (q) => q.eq("userId", args_0.userId)).unique();
      const date = Date.now();
      if (existing) {
        return await ctx.db.patch(existing._id, {
          accessToken: args_0.accessToken,
          refreshToken: args_0.refreshToken,
          expiresAtMs: args_0.expiresAtMs,
          updatedAt: date,
        });
      } else {
        return await ctx.db.insert("googleTokens", {
          userId: args_0.userId,
          userEmail: args_0.userEmail,
          accessToken: args_0.accessToken,
          refreshToken: args_0.refreshToken,
          expiresAtMs: args_0.expiresAtMs,
          createdAt: date,
          updatedAt: date,
        });
      }
    } catch (error) {
    }
  },
});

export const isCalendarConnected = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args_0) {
    const account = await ctx.db.query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", args_0.userId)).unique();
    if (account?.refreshToken && account?.accessToken && account?.expiresAtMs > Date.now()) {
      return { connected: true, email: account.userEmail };
    }
    return { connected: false, email: null };
  },

});
export const getTokenById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const account = await ctx.db.query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId)).unique();
    return account;
  }
});


export const getFreeBusy = action({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, { userId }) => {
    console.log("Action has been called");
    // get the token by users 
    const tokenRow = await ctx.runQuery(internal.calendar.getTokenById, { userId })
    console.log(tokenRow);
  }
})
