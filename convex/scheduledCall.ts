import { internalAction, query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";


export const create = mutation({
  args: {
    userId: v.id("users"),
    scheduledAtUtc: v.number(),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, { userId, scheduledAtUtc, retryCount }) => {
    try {
      const scheduledAtMs = new Date(scheduledAtUtc);
      const user = await ctx.db.get(userId);
      if (!user) throw new Error("User not found");

      // validate if the time is the future
      if (!user.mainCalendarId) throw new Error("Calendar id not connected");

      if (scheduledAtUtc < Date.now())
        throw new Error("Scheduled time must be in the future");

      // Schedule the call in the database
      const scheduledCall = await ctx.db.insert(
        "scheduledCalls", {
        userId,
        scheduledAtUtc,
        retryCount,
        status: "scheduled",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.scheduler.runAt(scheduledAtUtc, api.core.calls.actions.initiateCalendarCall, {
        userId: user?._id,
      });

      // await
      return scheduledCall;

    } catch (error) {
      console.error("Error scheduling call:", error);
      return null;
    }
  },
});

// call that are supposed to be processed
export const getDueCalls = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduledCalls")
      .withIndex("by_status_time", (q) =>
        q.eq("status", "scheduled")
          .gte("scheduledAtUtc", args.startTime)
          .lte("scheduledAtUtc", args.endTime)
      )
      .collect();
  },
});

export const getScheduledCalls = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("scheduledCalls");
    const call = query.withIndex("by_user", (q) => q.eq("userId", args.userId));

    return await query.order("desc").take(10);
  },
});

export const processScheduledCalls = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000); // 5 minute window

    console.log("[processScheduledCalls] Checking for calls between", fiveMinutesAgo, "and", now);


    // Get calls that are due (within 5 minute window)
    // Add type annotation to help TypeScript understand the type
    const dueCalls: any[] = await ctx.runQuery(api.scheduledCall.getDueCalls, {
      startTime: fiveMinutesAgo,
      endTime: now,
    });
    console.log("[DEBUG] dueCalls result type:", dueCalls ? typeof dueCalls : "null",
      Array.isArray(dueCalls) ? "is array" : "not array");
    if (!dueCalls) throw new Error("Failed to fetch due calls");

    console.log("[processScheduledCalls] Found", dueCalls.length, "due calls");

    for (const scheduledCall of dueCalls) {
      try {
        await ctx.runMutation(internal.scheduledCall.processScheduledCall, {
          scheduledCallId: scheduledCall._id,
        });
      } catch (error) {
        console.error("[processScheduledCalls] Failed to process call", scheduledCall._id, error);
      }
    }

    return { processedCount: dueCalls.length };
  },
});

export const processScheduledCall = internalMutation({
  args: {
    scheduledCallId: v.id("scheduledCalls"),
  },
  handler: async (ctx, args) => {
    // Get the scheduled call
    const scheduledCall = await ctx.db.get(args.scheduledCallId);
    if (!scheduledCall || scheduledCall.status !== "in_progress") {
      console.log("[processScheduledCall] Call not found or not pending:", args.scheduledCallId);
      return;
    }

    // Mark as in_progress to prevent double processing
    await ctx.db.patch(args.scheduledCallId, {
      status: "in_progress",
      updatedAt: Date.now(),
    });

    try {
      // Get user details for the call
      const user = await ctx.db.get(scheduledCall.userId);
      if (!user || !user.phone) {
        throw new Error("User not found or no phone number");
      }

      // Initiate the actual call (you'll integrate with your existing ElevenLabs flow)
      // For now, let's just simulate this
      console.log("[processScheduledCall] Would call user:", user.email, "at:", user.phone);

      // TODO: Replace this with your actual ElevenLabs call initiation
      // const callResult = await ctx.runAction(api.calls.initiateCall, {
      //   userId: scheduledCall.userId,
      //   toNumber: user.phone,
      // });

      // Mark as completed
      await ctx.db.patch(args.scheduledCallId, {
        status: "completed",
        updatedAt: Date.now(),
      });

      console.log("[processScheduledCall] Successfully processed call:", args.scheduledCallId);

    } catch (error) {
      console.error("[processScheduledCall] Error processing call:", error);

      // Mark as failed
      await ctx.db.patch(args.scheduledCallId, {
        status: "failed",
        updatedAt: Date.now(),
      });
    }
  },
});
