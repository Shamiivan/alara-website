import { action } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { Ok, Err, Result } from "../../shared/result";
import { validateISODateString, validateTimezone } from "./utils";
import { api } from "../../_generated/api";

export const createTask = action({
  args: {
    title: v.string(),
    due: v.string(),
    timezone: v.string(),
    callId: v.optional(v.id("calls")),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    userId: v.id("users"),
    reminderMinutesBefore: v.optional(v.number()),
  },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.id("tasks") }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args): Promise<Result<Id<"tasks">>> => {
    try {
      const { title, due, timezone, status, source, callId, userId, reminderMinutesBefore } = args;

      // Validation checks
      if (!title?.trim()) {
        return Err("Title is required");
      }

      const dateValidation = validateISODateString(due);
      if (!dateValidation.isValid) {
        return Err(dateValidation.error!);
      }

      const timezoneValidation = validateTimezone(timezone);
      if (!timezoneValidation.isValid) {
        return Err(timezoneValidation.error!);
      }

      // Simple date handling - JavaScript handles timezone conversion automatically
      const dueDate = new Date(due);
      const minutesBefore = reminderMinutesBefore ?? 5;
      const reminderTime = dueDate.getTime() - (minutesBefore * 60 * 1000);

      // Create task
      const now = Date.now();
      const taskId = await ctx.runMutation(api.core.tasks.mutations.insertTask, {
        title: title.trim(),
        due,
        timezone,
        status: status || "scheduled",
        source: source || "manual",
        userId,
        callId,
        createdAt: now,
        updatedAt: now,
      });

      // Schedule reminder
      await ctx.scheduler.runAt(reminderTime, internal.core.tasks.mutations.runScheduledReminder, {
        taskId,
        userId,
      });

      console.log(`Scheduled reminder for task ${taskId} at ${new Date(reminderTime).toISOString()}`);

      return Ok(taskId);
    } catch (error) {
      console.error("Failed to create task:", error);
      return Err("Failed to create task, please try again");
    }
  },
});

export const createTaskFromWeb = action({
  args: {
    title: v.string(),
    due: v.string(),
    timezone: v.string(),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    userId: v.id("users"),
    reminderMinutesBefore: v.optional(v.number()),
  },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.id("tasks") }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args): Promise<Result<Id<"tasks">>> => {
    // Set source to "web" for web-created tasks
    return await ctx.runAction(api.core.tasks.actions.createTask, {
      ...args,
      source: "web"
    });
  },
});