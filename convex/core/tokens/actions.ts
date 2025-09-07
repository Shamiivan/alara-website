import { refreshAccessToken } from "../../integrations/google/auth";
import { v } from "convex/values";
import { internalQuery, internalMutation, internalAction, query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";


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
      const tokenRow = await ctx.runQuery(internal.core.tokens.queries.getTokenByUserId, { userId });
      if (!tokenRow) throw new Error(`No token found for user ${userId}`);

      // // Check if token is expired (with 30 second buffer)
      const isExpired = Date.now() + 30_000 >= tokenRow.expiresAtMs;

      if (!tokenRow.accessToken) throw new Error("Invalid access token");
      if (!isExpired) {
        return tokenRow.accessToken;
      }


      // Refresh the token using the integration function
      const googleResponse = await refreshAccessToken({
        refreshToken: tokenRow.refreshToken
      });

      // Update the token in the database
      const newExpiresAtMs = Date.now() + (googleResponse.expires_in * 1000);

      await ctx.runMutation(internal.core.tokens.mutations.updateToken, {
        tokenId: tokenRow._id,
        accessToken: googleResponse.access_token,
        expiresAtMs: newExpiresAtMs
      });


      return googleResponse.access_token;


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ensure valid token: ${errorMessage}`);
    }
  }
});