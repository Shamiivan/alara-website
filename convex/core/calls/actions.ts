"use node"
import { Result, Ok, Err } from "../../shared/result";
import { initiateCall } from "../../integrations/elevenlabs/calls";
import { api, internal } from "../../_generated/api";
import { v } from "convex/values"
import { Id } from "../../_generated/dataModel";
import { action } from "../../_generated/server";
import { CalendarCallData, buildCalendarContext, createDynamicVariables, getCalendarCallConfig, getReminderCallConfig } from "../calendars/utils";


export const initiateCalendarCall = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }): Promise<Result<CalendarCallData>> => {
    try {
      const user = await ctx.runQuery(api.core.users.queries.getUserById, { userId });
      const toNumber = user.phone;
      const calendarId = user.mainCalendarId;
      const timezone = user.timezone;

      if (!calendarId) throw new Error("Oops, looks like something is wrong with you main calendar:(");
      if (!toNumber) throw new Error("Ooops, looks like something is wrong with your phone number");
      console.log(`[initiateCalendarCall] Starting for user`);

      // 1. Validate configuration
      const config = getCalendarCallConfig();
      if (!config.success) {
        return Err(config.error);
      }

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const eventsResult = await ctx.runAction(api.core.calendars.actions.getCalendarEvents, {
        userId: userId,
        calendarId: calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
      });

      if (!eventsResult.success) {
        console.log(`[initiateCalendarCall] Failed to get events: ${eventsResult.error}`);
        return Err("Failed to fetch calendar events");
      }

      const availabilityResult = await ctx.runAction(api.core.calendars.actions.getAvailability, {
        events: eventsResult.data.events,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
      });

      if (!availabilityResult.success) {
        console.log(`[initiateCalendarCall] Failed to get availability: ${availabilityResult.error}`);
        return Err("Failed to calculate availability");
      }

      const contextResult = buildCalendarContext(
        availabilityResult.data.freeSlots,
        availabilityResult.data.busyPeriods
      );

      if (!contextResult.success) {
        return Err(contextResult.error);
      }

      const context = contextResult.data;

      // 6. Create dynamic variables
      const dynamicVariables = createDynamicVariables(
        user.name || "There",
        user.timezone || "America/Toronto",
        context
      );

      console.log("context", dynamicVariables);



      const callResult = await initiateCall({
        agentId: config.data.agentId,
        agentPhoneNumberId: config.data.agentPhoneNumberId,
        toNumber: toNumber,
        dynamicVariables,
      });

      if (!callResult.success) {
        return Err("Failed to initiate calendar call");
      }

      if (!callResult.data.callSid) {
        console.error("Error validating the call result", callResult.data);
        return Err("ElevenLabs did not return a call ID");
      }
      if (!callResult.data.conversationId) {
        console.error("Error Validation the conversation ID", callResult.data);
        return Err("ElevenLabs did not return a conversation ID");
      }

      const dbCallId = await ctx.runMutation(api.core.calls.mutations.createCallRecord, {
        userId: userId,
        toNumber: toNumber,
        purpose: "planning",
        agentId: config.data.agentId,
        elevenLabsCallId: callResult.data.callSid,
        conversationId: callResult.data.conversationId,
      });

      console.log("Initated Call", dbCallId);

      const message = `Calendar call initiated - ${context.freeSlots.length} free slots, ${context.busyPeriods.length} busy periods`;

      console.log(`[initiateCalendarCall] Success: ${message}`);

      return Ok({
        callId: dbCallId,
        elevenLabsCallId: callResult.data.callSid,
        conversationId: callResult.data.conversationId,
        message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[initiateCalendarCall] Unexpected error: ${errorMessage}`);
      return Err("An unexpected error occurred while initiating the calendar call");
    }
  },
});

interface ReminderCallData {
  callId: Id<"calls">;
  elevenLabsCallId: string;
  conversationId: string;
}

export const initiateReminderCall = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    userName: v.optional(v.string()),
    taskName: v.optional(v.string()),
    taskTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    taskId: v.id("tasks")
  },
  returns: v.union(
    v.object({
      success: v.literal(true), data: v.object({
        callId: v.id("calls"),
        elevenLabsCallId: v.string(),
        conversationId: v.string()
      })
    }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args): Promise<Result<ReminderCallData>> => {
    try {
      // Validate task exists
      const task = await ctx.runQuery(api.tasks.getTaskById, { taskId: args.taskId });
      if (!task) {
        return Err(`Task with ID ${args.taskId} not found`);
      }

      // Get environment configuration
      const config = getReminderCallConfig();
      if (!config.success) {
        return Err(config.error);
      }

      // Prepare call request
      const callRequest = {
        agentId: config.data.agentId,
        agentPhoneNumberId: config.data.agentPhoneNumberId,
        toNumber: args.toNumber,
        dynamicVariables: {
          user_name: args.userName || "There",
          user_timezone: args.timezone || "America/Toronto",
          task_name: args.taskName!,
          task_time: args.taskTime!,
        }
      };

      // Make the call through integration layer
      const callResult = await initiateCall(callRequest);
      if (!callResult.success) {
        await logCallError(ctx, args.toNumber, callResult.error);
        return Err("Failed to initiate reminder call");
      }

      // Validate required fields from ElevenLabs response
      if (!callResult.data.callSid) {
        return Err("ElevenLabs did not return a call ID");
      }

      const elevenLabsCallId = callResult.data.callSid;
      const conversationId = callResult.data.conversationId!;

      // Create call record using the proper mutation
      const dbCallId = await ctx.runMutation(api.core.calls.mutations.createCallRecord, {
        userId: args.userId,
        toNumber: args.toNumber,
        purpose: "reminder",
        agentId: config.data.agentId,
        elevenLabsCallId: elevenLabsCallId,
        conversationId: conversationId,
      });

      return Ok({
        callId: dbCallId,
        elevenLabsCallId: elevenLabsCallId,
        conversationId: conversationId
      });

    } catch (error) {
      await logCallError(ctx, args.toNumber, error instanceof Error ? error.message : String(error));
      return Err("An unexpected error occurred while initiating the reminder call");
    }
  },
});

// Helper function for error logging
async function logCallError(ctx: any, toNumber: string, errorMessage: string) {
  await ctx.runMutation(api.events.logErrorInternal, {
    category: "calls",
    message: `Failed to initiate reminder call: ${errorMessage}`,
    details: {
      toNumber,
      error: errorMessage,
    },
    source: "convex",
  });
}