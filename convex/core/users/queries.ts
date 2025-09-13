import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getUserByCtx } from "../../utils/getUser";
import { Doc } from "../../_generated/dataModel";

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


export const getUsersForDailyCalls = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    name: v.optional(v.string()),
    callTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    wantsClarityCalls: v.optional(v.boolean()),
    mainCalendarId: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isOnboarded: v.optional(v.boolean()),
    callTimeUtc: v.optional(v.string()),
    wantsCallReminders: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
    hasPaid: v.optional(v.boolean()),
    paidAt: v.optional(v.number()),
    tokenIdentifier: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    // Public query for admin/debugging
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("wantsClarityCalls"), true))
      .collect();
  },
});