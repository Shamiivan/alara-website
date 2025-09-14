import { internalAction, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../_generated/api";

const CALL_WINDOW = 5; // 5 min 

export const processDailyCalls = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    try {
      const now = new Date();
      console.log(`[processDailyCalls] Running at ${now.toISOString()}`);

      const users = await ctx.runQuery(internal.core.calls.crons.getUsersForClarityCalls, {});
      let callsInitiated = 0;

      for (const user of users) {
        try {
          console.log(`[processDailyCalls] Processing user ${user.name} (${user._id})`);

          // Skip if missing required fields (already filtered in query, but double-check)
          if (!user.callTime || !user.timezone || !user.mainCalendarId || !user.phone) {
            console.log(`[processDailyCalls] Skipping ${user.name} - missing required fields`);
            continue;
          }

          // Check if it's time to call this user
          let userLocalTime;
          try {
            userLocalTime = new Date(now.toLocaleString("en-US", {
              timeZone: user.timezone
            }));
          } catch (error) {
            console.error(`[processDailyCalls] Invalid timezone ${user.timezone} for user ${user._id}`);
            continue;
          }
          // Skip if already called today
          const alreadyCalledToday = await ctx.runQuery(internal.core.calls.crons.getLastClarityCall, {
            userId: user._id
          });

          if (alreadyCalledToday) {
            console.log(`[processDailyCalls] Skipping ${user.name} - already called today`);
            continue;
          }


          const [hours, minutes] = user.callTime.split(':').map(Number);

          // Skip if invalid time format
          if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.error(`[processDailyCalls] Invalid time format ${user.callTime} for user ${user._id}`);
            continue;
          }

          // Debug time comparison
          console.log(`[processDailyCalls] User ${user.name}: callTime=${user.callTime}, timezone=${user.timezone}`);
          console.log(`[processDailyCalls] User local time: ${userLocalTime.toLocaleString()} (${userLocalTime.getHours()}:${userLocalTime.getMinutes()})`);
          console.log(`[processDailyCalls] Target time: ${hours}:${minutes}, Window: ${CALL_WINDOW} minutes`);

          // Skip if not in call window
          const isCallTime = userLocalTime.getHours() === hours && userLocalTime.getMinutes() < CALL_WINDOW;
          console.log(`[processDailyCalls] Is call time? ${isCallTime} (hour match: ${userLocalTime.getHours() === hours}, minute check: ${userLocalTime.getMinutes()} < ${CALL_WINDOW})`);

          if (!isCallTime) {
            console.log(`[processDailyCalls] Skipping ${user.name} - not in call window`);
            continue;
          }

          // All checks passed - initiate call
          console.log(`[processDailyCalls] Calling ${user.name} (${user._id}) at ${userLocalTime.toLocaleString()}`);

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

      console.log(`[processDailyCalls] Completed. Initiated ${callsInitiated} calls out of ${users.length} eligible users`);
      return null;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[processDailyCalls] Critical error: ${errorMessage}`);

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

// New query to check if user was called today for clarity calls
export const getLastClarityCall = internalQuery({
  args: {
    userId: v.id("users")
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    const todayCall = await ctx.db
      .query("calls")
      .withIndex("by_user_and_purpose", q =>
        q.eq("userId", args.userId).eq("purpose", "planning")
      )
      .filter(q =>
        q.and(
          q.gte(q.field("initiatedAt"), startOfDay),
          q.lte(q.field("initiatedAt"), endOfDay)
        )
      )
      .first();
    console.log("Running today call", todayCall);
    return todayCall !== null;
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