import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "../../_generated/api";

export const createUser = mutation({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      tokenIdentifier: v.optional(v.string()),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      image: v.optional(v.string()),
      phone: v.optional(v.string()),
      isOnboarded: v.optional(v.boolean()),
      callTime: v.optional(v.string()),
      callTimeUtc: v.optional(v.string()),
      timezone: v.optional(v.string()),
      wantsCallReminders: v.optional(v.boolean()),
      wantsClarityCalls: v.optional(v.boolean()),
      updatedAt: v.optional(v.number()),
      hasPaid: v.optional(v.boolean()),
      paidAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
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
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    wantsClarityCalls: v.optional(v.boolean()),
    callTime: v.string(),
    wantsCallReminders: v.boolean(),
    timezone: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
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

      // Validate time format (basic validation for HH:MM format)
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
        timezone: args.timezone,
        wantsCallReminders: args.wantsCallReminders,
        isOnboarded: true,
        updatedAt: Date.now(),
      };

      await ctx.db.patch(userId, updateData);

      console.log("[completeOnboarding] Onboarding completed successfully for userId:", userId);
      return { success: true };
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
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    timezone: v.optional(v.string()),
    wantsClarityCalls: v.optional(v.boolean()),
    wantsCallReminders: v.optional(v.boolean()),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      tokenIdentifier: v.optional(v.string()),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      image: v.optional(v.string()),
      phone: v.optional(v.string()),
      isOnboarded: v.optional(v.boolean()),
      callTime: v.optional(v.string()),
      callTimeUtc: v.optional(v.string()),
      timezone: v.optional(v.string()),
      wantsCallReminders: v.optional(v.boolean()),
      wantsClarityCalls: v.optional(v.boolean()),
      updatedAt: v.optional(v.number()),
      hasPaid: v.optional(v.boolean()),
      paidAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Only update fields that are provided
      const updateData: any = {
        updatedAt: Date.now(),
      };

      if (args.name !== undefined) updateData.name = args.name;
      if (args.phone !== undefined) updateData.phone = args.phone;
      if (args.timezone !== undefined) updateData.timezone = args.timezone;
      if (args.wantsClarityCalls !== undefined) updateData.wantsClarityCalls = args.wantsClarityCalls;
      if (args.wantsCallReminders !== undefined) updateData.wantsCallReminders = args.wantsCallReminders;

      await ctx.db.patch(userId, updateData);

      const updatedUser = await ctx.db.get(userId);
      console.log("[updateUser] User updated successfully:", userId);
      return updatedUser;
    } catch (error) {
      console.error("[updateUser] Error:", error);
      throw error;
    }
  },
});

export const updateCallTime = mutation({
  args: {
    callTime: v.string(),
    callTimeUtc: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      tokenIdentifier: v.optional(v.string()),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      image: v.optional(v.string()),
      phone: v.optional(v.string()),
      isOnboarded: v.optional(v.boolean()),
      callTime: v.optional(v.string()),
      callTimeUtc: v.optional(v.string()),
      timezone: v.optional(v.string()),
      wantsCallReminders: v.optional(v.boolean()),
      wantsClarityCalls: v.optional(v.boolean()),
      updatedAt: v.optional(v.number()),
      hasPaid: v.optional(v.boolean()),
      paidAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Check if the call time is changed
      const user = await ctx.db.get(userId);
      if (!user) throw new Error("User not found");

      // Check if either local time or UTC time has changed
      const isCallTimeChanged = user.callTime !== args.callTime;
      const isCallTimeUtcChanged = args.callTimeUtc && user.callTimeUtc !== args.callTimeUtc;

      if (!isCallTimeChanged && !isCallTimeUtcChanged) {
        throw new Error("Call time is the same");
      }

      // Update the user's call time and timezone
      const updateData: any = {
        callTime: args.callTime,
        updatedAt: Date.now(),
      };

      if (args.callTimeUtc) updateData.callTimeUtc = args.callTimeUtc;
      if (args.timezone) updateData.timezone = args.timezone;

      await ctx.db.patch(userId, updateData);

      // Create scheduled call if callTimeUtc is provided
      if (args.callTimeUtc) {
        await ctx.runMutation(api.scheduledCall.create, {
          userId,
          scheduledAtUtc: Date.parse(args.callTimeUtc),
          retryCount: 0,
        });
      }

      console.log("[updateCallTime] Updated call time for user:", userId);
      const updatedUser = await ctx.db.get(userId);
      return updatedUser;
    } catch (error) {
      console.error("[updateCallTime] Error:", error);
      return null;
    }
  },
});