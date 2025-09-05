import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getUserByCtx } from "../../utils/getUser";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getUserByCtx(ctx);
  },
});

export const isUserOnboarded = query({
  args: {},
  returns: v.object({
    isAuthenticated: v.boolean(),
    isOnboarded: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isAuthenticated: false, isOnboarded: false };
    }

    const user = await ctx.db.get(userId);
    return {
      isAuthenticated: true,
      isOnboarded: user?.isOnboarded ?? false,
    };
  },
});

export const checkUserStatus = query({
  args: {},
  returns: v.object({
    isAuthenticated: v.boolean(),
    isOnboarded: v.boolean(),
    hasPaid: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isAuthenticated: false,
        isOnboarded: false,
        hasPaid: false,
      };
    }

    const user = await ctx.db.get(userId);
    return {
      isAuthenticated: true,
      isOnboarded: user?.isOnboarded ?? false,
      hasPaid: user?.hasPaid ?? false,
    };
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error(`User not found for email: ${email}`);
    }

    return user;
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error(`User not found for id: ${userId}`);
    }

    return user;
  },
});