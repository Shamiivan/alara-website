"use node"
import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { google } from "googleapis";
import { api, internal } from "./_generated/api";
import { version } from "os";

export const freeBusyToday = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    try {
      const account = await ctx.runQuery(internal.calendar.getAccount, { userId });
      if (!account) throw new Error("Google Calendar not connected.");

      const oauth = new google.auth.OAuth2(
        process.env.GCAL_CLIENT_ID!,
        process.env.GCAL_CLIENT_SECRET!,
        process.env.GCAL_REDIRECT_URI!
      );

      oauth.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
        expiry_date: account.expiresAtMs,
      });

      // If expired, refresh and persist
      const expiring = !account.expiresAtMs || account.expiresAtMs < Date.now() + 60_000;
      if (expiring && account.refreshToken) {
        const { credentials } = await oauth.refreshAccessToken();
        const row = await ctx.runMutation(api.calendar.upsertTokens, {
          userId: account.userId,
          userEmail: account.userEmail,
          accessToken: credentials.access_token!,
          refreshToken: credentials.refresh_token!,
          expiresAtMs: credentials.expiry_date!
        });
      }

      const calendar = google.calendar({ version: "v3", auth: oauth });
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      const res = await calendar.freebusy.query({
        requestBody: {
          timeMin: now.toISOString(),
          timeMax: end.toISOString(),
          items: [{ id: "primary" }],
        },
      });

      return res.data;
    } catch (error) {
      console.error("Error fetching free/busy data:", error);
      return null;
    }
  },
});