// core/calendar/queries.ts
import { refreshAccessToken } from "../integrations/google/auth";
import { v } from "convex/values";
import { internalQuery, internalMutation, internalAction, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";


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

export const updateToken = internalMutation({
  args: {
    tokenId: v.id("googleTokens"),
    accessToken: v.string(),
    expiresAtMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, {
      accessToken: args.accessToken,
      expiresAtMs: args.expiresAtMs,
      updatedAt: Date.now(),
    });
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

/**
 * Ensures a user has a valid access token, refreshing if expired
 */
export const ensureValidToken = internalAction({
  args: {
    userId: v.id("users")
  },
  returns: v.string(),
  handler: async (ctx, { userId }): Promise<string> => {
    try {
      console.log("Ensuring valid token for userId:", userId);
      const tokenRow = await ctx.runQuery(internal.core.tokens.getTokenByUserId, { userId });
      if (!tokenRow) throw new Error(`No token found for user ${userId}`);

      // // Check if token is expired (with 30 second buffer)
      const isExpired = Date.now() + 30_000 >= tokenRow.expiresAtMs;

      if (!tokenRow.accessToken) throw new Error("Invalid access token");
      if (!isExpired) {
        console.log("Token is valid, returning existing access token");
        return tokenRow.accessToken;
      }

      console.log("Token is expired, refreshing...");

      // Refresh the token using the integration function
      const googleResponse = await refreshAccessToken({
        refreshToken: tokenRow.refreshToken
      });

      // Update the token in the database
      const newExpiresAtMs = Date.now() + (googleResponse.expires_in * 1000);

      await ctx.runMutation(internal.core.tokens.updateToken, {
        tokenId: tokenRow._id,
        accessToken: googleResponse.access_token,
        expiresAtMs: newExpiresAtMs
      });

      console.log("Token refreshed successfully");
      return googleResponse.access_token;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ensure valid token for user ${userId}: ${errorMessage}`);
    }
  }
});