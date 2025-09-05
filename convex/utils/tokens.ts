"use node"
import { internal } from "../_generated/api";
import { action, internalAction } from "../_generated/server";
import { v } from "convex/values"
import { api } from "../_generated/api";

export const refreshToken = internalAction({
  args: { tokenId: v.id("googleTokens") },
  handler: async (ctx, { tokenId }) => {
    try {
      const client_id = process.env.AUTH_GOOGLE_ID;
      const client_secret = process.env.AUTH_GOOGLE_SECRET;

      if (!client_id || !client_secret) throw new Error("Invalid client ID");

      const row = await ctx.runQuery(internal.google.getTokenById, { rowId: tokenId })
      if (!row) throw new Error("Invalid token row");

      // Call Google's token endpoint to refresh the token
      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id,
          client_secret,
          refresh_token: row.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenResp.ok) throw new Error("Unknown error");

      const tokens = await tokenResp.json() as {
        access_token: string,
        expires_in: number;
        token_type: string;
        scope?: string;
      };

      await ctx.runMutation(api.calendar.upsertTokens, {
        userId: row.userId,
        userEmail: row.userEmail,
        accessToken: tokens.access_token,
        refreshToken: row.refreshToken,
        expiresAtMs: Date.now() + (tokens.expires_in * 1000)
      });

      return {
        success: true,
        accessToken: tokens.access_token,
        expiresAtMs: Date.now() + (tokens.expires_in || 3600) * 1000
      };
    } catch (error) {
      console.log("Error refreshing token:", error);
      // Handle the unknown type error properly
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        accessToken: null
      };
    }
  }
});
