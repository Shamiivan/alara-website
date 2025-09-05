import { v } from "convex/values";
import { mutation, query, internalQuery } from "../../_generated/server"
import { api } from "../../_generated/api";

/**
 * Upsert Google OAuth tokens for a user (by email from OAuth flow)
 */
export const upsertTokensByEmail = mutation({
  args: {
    userEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAtMs: v.number(),
  },
  handler: async (ctx, { userEmail, accessToken, refreshToken, expiresAtMs }) => {
    // Get user by email (from the core users module)
    const user = await ctx.runQuery(api.core.users.queries.getUserByEmail, {
      email: userEmail,
    });

    if (!user) {
      throw new Error(`User not found for email: ${userEmail}`);
    }

    const existing = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAtMs: expiresAtMs,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("googleTokens", {
        userId: user._id,
        userEmail: userEmail,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAtMs: expiresAtMs,
        createdAt: now,
        updatedAt: now,
      });
    }

  },
});

/**
 * Upsert Google OAuth tokens for a user (by userId)
 */
export const upsertTokens = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAtMs: v.number(),
  },
  handler: async (ctx, { userId, accessToken, refreshToken, expiresAtMs }) => {
    try {
      // Get user email from the users table
      const user = await ctx.db.get(userId);
      if (!user?.email) {
        throw new Error("User not found or missing email");
      }

      const existing = await ctx.db
        .query("googleTokens")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      const now = Date.now();

      if (existing) {
        return await ctx.db.patch(existing._id, {
          accessToken,
          refreshToken,
          expiresAtMs,
          updatedAt: now,
        });
      } else {
        return await ctx.db.insert("googleTokens", {
          userId,
          userEmail: user.email,
          accessToken,
          refreshToken,
          expiresAtMs,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.error("[upsertTokens] Error:", error);
      throw error;
    }
  },
});
