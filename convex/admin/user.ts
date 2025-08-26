import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// update user's call time and schedule next call
export const updateCallTime = mutation({
  args: {
    email: v.string(),
    callTime: v.string(),
  },
  handler: async (ctx, { callTime, email }) => {
    // get user from email
    try {
      const user = await ctx.db.query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (!user) throw new Error("User not found");
      // Update the user's call time and time zone
      await ctx.db.patch(user._id, {
        callTimeUtc: callTime,
      });

      // run mutation to create scheduled call
      await ctx.runMutation(api.scheduledCall.create, {
        userId: user._id,
        scheduledAtUtc: Date.parse(callTime),
        retryCount: 0,
      });
      return user;
    } catch (error) {
      console.error("[updateCallTime] Error:", error);
      throw new Error("Failed to retrieve user");
    }

  }
});


