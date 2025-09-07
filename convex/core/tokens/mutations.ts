
// core/calendar/queries.ts
import { refreshAccessToken } from "../../integrations/google/auth";
import { v } from "convex/values";
import { internalQuery, internalMutation, internalAction, query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";



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

export const createToken = internalMutation({
  args: {
    userId: v.id("users"),
    userEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAtMs: v.number(),
  },
  returns: v.id("googleTokens"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("googleTokens", {
      userId: args.userId,
      userEmail: args.userEmail,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAtMs: args.expiresAtMs,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});