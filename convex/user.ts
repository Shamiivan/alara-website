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
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
    phoneNumber: v.optional(v.string()),
    callTime: v.string(),
    wantsCallReminders: v.boolean(),
    // Optional fields from the validator
    biggestChallenge: v.optional(v.string()),
    callFrequency: v.optional(v.string()),
    feedbackParticipation: v.optional(v.boolean()),
    purpose: v.optional(v.string()),
    supportType: v.optional(v.array(v.string())),
    timeOfDay: v.optional(v.array(v.string())),
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
      throw new Error("User not found");
    }

    if (user.isOnboarded) {
      throw new Error("User is already onboarded");
    }

    // Validate time format (basic validation for HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(args.callTime)) {
      throw new Error("Invalid time format. Use HH:MM format (e.g., '09:00', '14:30')");
    }

    await ctx.db.patch(user._id, {
      phone: args.phoneNumber, // Map phoneNumber to phone in the database
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
    return {
      isAuthenticated: true,
      isUserOnboarded: user?.isOnboarded ?? false,
    }
  },
});

// New function to ensure user record exists with proper fields after auth
export const ensureUserRecord = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // First try to find by tokenIdentifier
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      // If not found by token, try to find by email and update
      user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", identity.email))
        .unique();

      if (user) {
        // Update existing user with tokenIdentifier
        await ctx.db.patch(user._id, {
          tokenIdentifier: identity.tokenIdentifier,
          name: identity.name || user.name,
          isOnboarded: user.isOnboarded ?? false,
          updatedAt: Date.now(),
        });
      } else {
        // Create new user record
        const userId = await ctx.db.insert("users", {
          tokenIdentifier: identity.tokenIdentifier,
          email: identity.email!,
          name: identity.name,
          isOnboarded: false,
          updatedAt: Date.now(),
        });
        user = await ctx.db.get(userId);
      }
    }

    return user;
  }
});