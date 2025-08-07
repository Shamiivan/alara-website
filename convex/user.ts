import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { isAuthenticated } from "./auth";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user ID directly
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Log authentication error (but don't store in DB since we can't get userId)
      console.warn("[getCurrentUser] User not authenticated");
      throw new Error("User not Authenticated");
    }

    // Get user directly by ID
    const user = await ctx.db.get(userId);

    console.log("[getCurrentUser] Retrieved user for userId:", userId);
    return user;
  },
})

export const createUser = mutation({
  args: {},
  handler: async (ctx, args_0) => {
    // Get the authenticated user ID directly
    const id = await getAuthUserId(ctx);
    if (!id) {
      console.warn("[createUser] Not authenticated");
      throw new Error("Not Authenticated");
    }

    // Check if user already exists by ID
    const existingUser = await ctx.db.get(id);
    if (existingUser) {
      console.log("[createUser] User already exists:", id);
      return existingUser;
    }

    // Get user identity for additional fields
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.warn("[createUser] No identity found");
      throw new Error("Not Authenticated");
    }

    console.log("[createUser] Creating new user with ID:", id, "email:", identity.email);

    // Create user with the same ID as auth user
    await ctx.db.patch(id, {
      email: identity.email!,
      name: identity.name,
      isOnboarded: false,
      updatedAt: Date.now(),
    });

    // Return the user
    const newUser = await ctx.db.get(id);
    console.log("[createUser] User created successfully:", id);
    return newUser;
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
    try {
      // Get the authenticated user ID directly
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        console.warn("[completeOnboarding] Not authenticated");
        throw new Error("Not authenticated");
      }

      console.log("[completeOnboarding] Starting onboarding for userId:", userId);

      // Get user directly by ID
      const user = await ctx.db.get(userId);
      if (!user) {
        console.error("[completeOnboarding] User not found:", userId);
        throw new Error("User not found");
      }

      // Get identity for name fallback
      const identity = await ctx.auth.getUserIdentity();

      // Validate time format(basic validation for HH:MM format)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(args.callTime)) {
        console.warn("[completeOnboarding] Invalid time format:", args.callTime);
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

      await ctx.db.patch(userId, updateData);

      console.log("[completeOnboarding] Onboarding completed successfully for userId:", userId);
      return { success: true }
    } catch (error) {
      console.error("[completeOnboarding] Error:", error);

      // Try to log error to events table
      try {
        await ctx.runMutation(api.events.logErrorInternal, {
          category: "onboarding",
          message: `Onboarding completion failed: ${error instanceof Error ? error.message : String(error)}`,
          details: {
            args,
            error: error instanceof Error ? error.stack : String(error),
          },
          source: "convex",
        });
      } catch (logError) {
        console.error("[completeOnboarding] Failed to log error:", logError);
      }

      throw error;
    }
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
    try {
      // Get the authenticated user ID directly
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        console.log("[isUserOnboarded] User not authenticated");
        return { isAuthenticated: false, isOnboarded: false }
      }

      // Get user directly by ID
      const user = await ctx.db.get(userId);

      return {
        isAuthenticated: true,
        isUserOnboarded: user?.isOnboarded ?? false,
      }
    } catch (error) {
      console.error("[isUserOnboarded] Error:", error);
      return { isAuthenticated: false, isOnboarded: false }
    }
  },
});

// Check complete user status (auth, onboarding, payment)
export const checkUserStatus = query({
  args: {},
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      console.error("[checkUserStatus] Error:", error);
      return {
        isAuthenticated: false,
        isOnboarded: false,
        hasPaid: false
      }
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
    try {
      await ctx.db.patch(args.userId, {
        hasPaid: true,
        paidAt: Date.now(),
      });

      console.log("[markUserPaid] User marked as paid:", args.userId);
    } catch (error) {
      console.error("[markUserPaid] Error:", error);

      // Log error to events table
      try {
        await ctx.runMutation(api.events.logErrorInternal, {
          category: "payment",
          message: `Failed to mark user as paid: ${error instanceof Error ? error.message : String(error)}`,
          details: {
            userId: args.userId,
            error: error instanceof Error ? error.stack : String(error),
          },
          source: "convex",
        });
      } catch (logError) {
        console.error("[markUserPaid] Failed to log error:", logError);
      }

      throw error;
    }
  },
});