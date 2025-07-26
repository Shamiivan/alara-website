import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isAuthenticated } from "./auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token")
      .unique();
    return user;
  },
})

export const createUser = mutation({
  args: {},
  handler: async (ctx, args_0) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not Authenticated");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token")
      .unique();

    if (existingUser) {
      return existingUser;
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email!,
      name: identity.name,
      isOnboarded: false,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  }
});

// complete onboarding 
export const completeOnboarding = mutation({
  args: {
    callTime: v.string(),
    wantsCallReminders: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
    if (!user) {
      throw new Error("User is already onboarded");
    }

    // Validate time format (basic validation for HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(args.callTime)) {
      throw new Error("Invalid time format. Use HH:MM format (e.g., '09:00', '14:30')");
    }


    await ctx.db.patch(user._id, {
      callTime: args.callTime,
      wantsCallReminders: args.wantsCallReminders,
      isOnboarded: true,
      updatedAt: Date.now(),
    });
    return { success: true }
  }
});


export const updateUser = mutation({
  args: {},
  handler: async (ctx, args) => {
  },
});

export const isUserOnboarded = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAuthenticated: false, isOnboarded: false }
    }

    const user = await ctx.db.query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
    return { isAuthenticated: true, isUserOnboarded: user?.isOnboarded ?? false, }
  },

});
