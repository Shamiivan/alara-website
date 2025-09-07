import { internalAction, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../_generated/api";

export const processDailyCalls = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    try {
      const now = new Date();
      console.log(`[processDailyCalls] Running at ${now.toISOString()}`);

      // Get users who want clarity calls and have all required fields
      const users = await ctx.runQuery(internal.core.calls.crons.getUsersForClarityCalls, {});

      let callsInitiated = 0;

      for (const user of users) {
        if (shouldCallUser(user, now)) {
          console.log(`[processDailyCalls] Calling ${user.name} (${user._id}) at ${user.callTime} in ${user.timezone}`);

          try {
            const result = await ctx.runAction(api.core.calls.actions.initiateCalendarCall, {
              userId: user._id
            });

            if (result.success) {
              callsInitiated++;
              console.log(`[processDailyCalls] Successfully initiated call for ${user.name}`);
            } else {
              console.error(`[processDailyCalls] Failed to call ${user.name}: ${result.error}`);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[processDailyCalls] Exception calling ${user.name}: ${errorMessage}`);

            await ctx.runMutation(api.events.logErrorInternal, {
              category: "calls",
              message: `Daily clarity call exception for user ${user._id}: ${errorMessage}`,
              details: {
                userId: user._id,
                userName: user.name,
                error: errorMessage
              },
              source: "convex",
            });
          }
        }
      }

      console.log(`[processDailyCalls] Completed. Initiated ${callsInitiated} calls out of ${users.length} eligible users`);
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[processDailyCalls] Critical error: ${errorMessage}`);

      // Log critical cron failure
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "system",
        message: `Daily clarity calls cron failed: ${errorMessage}`,
        details: { error: errorMessage },
        source: "convex",
      });

      return null;
    }
  },
});

export const getUsersForClarityCalls = internalQuery({
  args: {},
  returns: v.array(v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    name: v.optional(v.string()),
    callTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    mainCalendarId: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isOnboarded: v.optional(v.boolean()),
    callTimeUtc: v.optional(v.string()),
    wantsCallReminders: v.optional(v.boolean()),
    wantsClarityCalls: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
    hasPaid: v.optional(v.boolean()),
    paidAt: v.optional(v.number()),
    tokenIdentifier: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter(q => q.and(
        q.eq(q.field("wantsClarityCalls"), true),
        q.neq(q.field("callTime"), undefined),
        q.neq(q.field("timezone"), undefined),
        q.neq(q.field("mainCalendarId"), undefined),
        q.neq(q.field("phone"), undefined)
      ))
      .collect();
  },
});

// Helper function to determine if we should call a user right now
function shouldCallUser(user: any, now: Date): boolean {
  if (!user.callTime || !user.timezone || !user.mainCalendarId || !user.phone) {
    return false;
  }

  try {
    // Get current time in user's timezone
    const userLocalTime = new Date(now.toLocaleString("en-US", {
      timeZone: user.timezone
    }));

    // Parse 24-hour format: "21:00" -> hour=21, minute=0
    const [hours, minutes] = user.callTime.split(':').map(Number);

    // Validate parsed time
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error(`[shouldCallUser] Invalid time format ${user.callTime} for user ${user._id}`);
      return false;
    }

    // Call if it's the right hour and within first 5 minutes
    return userLocalTime.getHours() === hours && userLocalTime.getMinutes() < 5;
  } catch (error) {
    console.error(`[shouldCallUser] Error processing user ${user._id} timezone ${user.timezone}: ${error}`);
    return false;
  }
}