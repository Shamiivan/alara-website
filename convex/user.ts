import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { isAuthenticated } from "./auth";
import { Id } from "./_generated/dataModel";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not Authenticated");

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
    console.log(identity);

    if (!identity) throw new Error("Not Authenticated");

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
    name: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    wantsClarityCalls: v.optional(v.boolean()),
    callTime: v.string(),
    wantsCallReminders: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // console.log(identity);
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
    if (!user) throw new Error("User not found");

    // Validate time format(basic validation for HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(args.callTime)) {
      throw new Error("Invalid time format. Use HH:MM format (e.g., '09:00', '14:30')");
    }
    console.log(user);
    await ctx.db.patch(user._id, {
      name: args.name || identity.name, // Use provided name or fallback to identity name
      phone: args.phoneNumber,
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

// Check complete user status (auth, onboarding, payment)
export const checkUserStatus = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAuthenticated: false,
        isOnboarded: false,
        hasPaid: false
      }
    }

    const user = await ctx.db.query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    return {
      isAuthenticated: true,
      isOnboarded: user?.isOnboarded ?? false,
      hasPaid: user?.hasPaid ?? false,
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

// Mark a user as paid
export const markUserPaid = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      hasPaid: true,
      paidAt: Date.now(),
    });
  },
});