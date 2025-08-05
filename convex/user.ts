import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { isAuthenticated } from "./auth";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user ID directly
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not Authenticated");

    // Log the user ID for debugging
    console.log("[getCurrentUser] Auth User ID:", userId);

    // Get user directly by ID
    const user = await ctx.db.get(userId);

    // Log the retrieved user for debugging
    console.log("[getCurrentUser] Retrieved user:", user);

    return user;
  },
})

export const createUser = mutation({
  args: {},
  handler: async (ctx, args_0) => {
    // Get the authenticated user ID directly
    const id = await getAuthUserId(ctx);
    if (!id) throw new Error("Not Authenticated");

    // Check if user already exists by ID
    const existingUser = await ctx.db.get(id);
    if (existingUser) return existingUser;

    // Get user identity for additional fields
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not Authenticated");

    // Create user with the same ID as auth user
    await ctx.db.patch(id, {
      email: identity.email!,
      name: identity.name,
      isOnboarded: false,
      updatedAt: Date.now(),
    });

    // Return the user
    return await ctx.db.get(id);
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
    // Get the authenticated user ID directly
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    console.log("[completeOnboarding] Auth User ID:", userId);
    console.log("[completeOnboarding] Onboarding data:", args);

    // Get user directly by ID
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    console.log("[completeOnboarding] Existing user:", user);

    // Get identity for name fallback
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      console.log("[completeOnboarding] Auth identity:", {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        name: identity.name
      });
    }

    // Validate time format(basic validation for HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(args.callTime)) {
      throw new Error("Invalid time format. Use HH:MM format (e.g., '09:00', '14:30')");
    }

    // Update user with onboarding information
    const updateData = {
      name: args.name || (identity ? identity.name : user.name), // Use provided name or fallback
      phone: args.phoneNumber,
      wantsClarityCalls: args.wantsClarityCalls,
      callTime: args.callTime,
      wantsCallReminders: args.wantsCallReminders,
      isOnboarded: true,
      updatedAt: Date.now(),
    };

    console.log("[completeOnboarding] Updating user with:", updateData);

    await ctx.db.patch(userId, updateData);

    // Get updated user for logging
    const updatedUser = await ctx.db.get(userId);
    console.log("[completeOnboarding] Updated user:", updatedUser);

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
    // Get the authenticated user ID directly
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isAuthenticated: false, isOnboarded: false }
    }

    // Get user directly by ID
    const user = await ctx.db.get(userId);

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
    // Get the authenticated user ID directly
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isAuthenticated: false,
        isOnboarded: false,
        hasPaid: false
      }
    }

    // Get user directly by ID
    const user = await ctx.db.get(userId);

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
    // Get the authenticated user ID directly
    const id = await getAuthUserId(ctx);
    if (!id) {
      throw new Error("Not authenticated");
    }

    console.log("[ensureUserRecord] Auth User ID:", id);

    // Check if user already exists by ID
    let user = await ctx.db.get(id);
    console.log("[ensureUserRecord] Existing user:", user);

    // Get user identity for additional fields
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    console.log("[ensureUserRecord] Auth identity:", {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      name: identity.name
    });

    if (user) {
      console.log("[ensureUserRecord] Updating existing user");
      // Update existing user with latest identity info
      await ctx.db.patch(id, {
        name: identity.name || user.name,
        email: identity.email || user.email,
        isOnboarded: user.isOnboarded ?? false,
        updatedAt: Date.now(),
      });
    } else {
      console.log("[ensureUserRecord] Creating new user with auth ID");
      // Create new user record with the auth user ID
      await ctx.db.patch(id, {
        email: identity.email!,
        name: identity.name,
        isOnboarded: false,
        updatedAt: Date.now(),
      });
    }

    // Return the updated user
    const updatedUser = await ctx.db.get(id);
    console.log("[ensureUserRecord] Updated user:", updatedUser);
    return updatedUser;
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