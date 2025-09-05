import { v } from "convex/values";
import { action, httpAction, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";




export const getTokenById = internalQuery({
  args: { rowId: v.id("googleTokens") },
  handler: async ({ db }, { rowId }) => {
    // get the row 
    return await db.get(rowId);
  }
})
export const upsertTokens = mutation({
  args: {
    userId: v.id("users"),
    userEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAtMs: v.number(),
  },
  async handler(ctx, { userId, userEmail, accessToken, refreshToken, expiresAtMs }) {
    try {
      const existing = await ctx.db.query("googleTokens").withIndex("by_user", (q) => q.eq("userId", userId)).first();
      const date = Date.now();
      if (existing) {
        return await ctx.db.patch(existing._id, {
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresAtMs: expiresAtMs,
          updatedAt: date,
        });
      } else {
        return await ctx.db.insert("googleTokens", {
          userId: userId,
          userEmail: userEmail,
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresAtMs: expiresAtMs,
          createdAt: date,
          updatedAt: date,
        });
      }
    } catch (error) {
    }
  },
});
