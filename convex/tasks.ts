import { timeStamp } from "console";
import { query, mutation, action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { user } from "@elevenlabs/elevenlabs-js/api";

// Shape we expect from the ElevenLabs 
type ToolCall = {
  type: "client" | "system" | string;
  requestId?: string;
  toolName?: string;             // we care when "create_task"
  paramsAsJson?: string;         // JSON string: { title, due, timezone }
  toolHasBeenCalled?: boolean;
  toolDetails?: { type?: string; parameters?: string };
};

type ConversationMessage = {
  role: "agent" | "user";
  message?: string;
  toolCalls?: ToolCall[];
  toolResults?: any[];
  timeInCallSecs?: number;
  interrupted?: boolean;
  // ...other fields omitted
};

type ParsedTask = {
  title: string;
  due: string;         // ISO with tz offset
  timezone: string;
};

function extractTasks(messages: ConversationMessage[]): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  for (const m of messages ?? []) {
    for (const tc of m.toolCalls ?? []) {
      if (tc.type === "client" && tc.toolName === "create_task" && tc.paramsAsJson) {
        try {
          const params = JSON.parse(tc.paramsAsJson);
          if (params?.title && params?.due && params?.timezone) {
            tasks.push({
              title: String(params.title),
              due: String(params.due),
              timezone: String(params.timezone),
            });
          }
        } catch (_) {
          // ignore bad JSON
        }
      }
    }
  }
  return tasks;
}

export const registerFromConversation = mutation({
  args: {
    callId: v.optional(v.id("calls")),
    userId: v.optional(v.id("users")),
    messages: v.array(v.any()),
  },
  handler: async (ctx, { callId, userId, messages }) => {
    const tasks = extractTasks(messages as ConversationMessage[]);
    const now = Date.now();

    const inserted: string[] = [];
    for (const t of tasks) {
      // de-dupe: same callId + title + due
      let existing = [];

      if (callId) {
        existing = await ctx.db
          .query("tasks")
          .withIndex("by_call_due", (q) => q.eq("callId", callId).eq("due", t.due))
          .collect();
      } else {
        // If no callId, just check by due date
        existing = await ctx.db
          .query("tasks")
          .withIndex("by_call_due", (q) => q.eq("callId", undefined).eq("due", t.due))
          .collect();
      }

      const already = existing.find((row) => row.title === t.title);
      if (already) continue;

      const id = await ctx.db.insert("tasks", {
        title: t.title,
        due: t.due,
        timezone: t.timezone,
        status: "scheduled",
        source: "elevenlabs",
        callId: callId || undefined,
        userId: userId || undefined,
        createdAt: now,
        updatedAt: now,
      });
      inserted.push(id);
    }
    return { insertedCount: inserted.length };
  },
});

export const get_tasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const update_task = mutation({
  args: {
    id: v.id("tasks"),
    status: v.optional(v.string()),
    title: v.optional(v.string()),
    due: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if task exists
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Update the task
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const delete_task = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { id } = args;

    // Check if task exists
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Delete the task
    await ctx.db.delete(id);

    return { success: true };
  },
});

export const create_task = mutation({
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
  handler: async (ctx, args) => {
    const { title, due, timezone, status, source, callId, userId, reminderMinutesBefore } = args;
    const now = Date.now();

    // get the due date from this format 2025-08-15T14:18:02.971Z to a number the scheduler can use
    if (!title || !due || !timezone) {
      throw new Error("Title, due date, and timezone are required");
    }

    const dueDate = new Date(due);
    if (isNaN(dueDate.getTime())) {
      throw new Error(`Invalid due date: ${due}`);
    }

    const id = await ctx.db.insert("tasks", {
      title,
      due,
      timezone,
      status: status || "scheduled",
      source: source || "manual",
      userId: userId || undefined,
      callId: callId,
      createdAt: now,
      updatedAt: now,
    });

    // Use the provided reminderMinutesBefore or default to 5 minutes
    const minutesBefore = reminderMinutesBefore !== undefined ? reminderMinutesBefore : 5;

    // Log the original values for debugging
    console.log(`[DEBUG] Original due date (ISO): ${due}`);
    console.log(`[DEBUG] User timezone: ${timezone}`);
    console.log(`[DEBUG] Parsed due date (UTC): ${dueDate.toISOString()}`);

    // Function to get timezone offset in milliseconds for a specific timezone
    function getTimezoneOffset(dateStr: string, timeZone: string): number {
      // Create a date formatter that will output dates in the specified timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      // Parse the original date
      const date = new Date(dateStr);

      // Format the date in the target timezone
      const parts = formatter.formatToParts(date);

      // Extract components from the formatted parts
      const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
      const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1; // 0-based
      const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
      const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const tzSecond = parseInt(parts.find(p => p.type === 'second')?.value || '0');

      // Create a new date with the timezone-adjusted components
      const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond));

      // Calculate the offset (UTC time - timezone time)
      return date.getTime() - tzDate.getTime();
    }

    // Calculate the timezone offset
    const timezoneOffset = getTimezoneOffset(due, timezone);
    console.log(`[DEBUG] Timezone offset for ${timezone}: ${timezoneOffset} ms (${timezoneOffset / (60 * 60 * 1000)} hours)`);

    // Adjust the reminder time based on the user's timezone
    // 1. Convert the UTC due date to the user's local time by applying the offset
    // 2. Calculate the reminder time by subtracting minutes
    // 3. Convert back to UTC for scheduling
    const adjustedDueDate = new Date(dueDate.getTime() - timezoneOffset);
    const localReminderTime = adjustedDueDate.getTime() - minutesBefore * 60 * 1000;
    const timeOfReminderCall = new Date(localReminderTime + timezoneOffset).getTime();

    console.log(`[DEBUG] Adjusted due date in user's timezone: ${new Date(adjustedDueDate).toISOString()}`);
    console.log(`[DEBUG] Local reminder time: ${new Date(localReminderTime).toISOString()}`);
    console.log(`[DEBUG] Final UTC reminder time: ${new Date(timeOfReminderCall).toISOString()}`);

    const callArgs = {
      taskId: id,
      userId: userId,
    };
    const jobId = await ctx.scheduler.runAt(timeOfReminderCall, internal.tasks.runScheduledReminder, callArgs);
    console.log(`Scheduled reminder for task ${id} at ${new Date(timeOfReminderCall).toLocaleTimeString()} UTC (${new Date(localReminderTime).toLocaleTimeString()} user local time) with job ID ${jobId}, ${minutesBefore} minutes before due time`);


  },
});

export const createTaskFromWeb = mutation({
  args: {
    title: v.string(),
    due: v.string(),
    timezone: v.string(),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    userId: v.id("users"),
    reminderMinutesBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { title, due, timezone, status, source, userId, reminderMinutesBefore } = args;
    const now = Date.now();

    // get the due date from this format 2025-08-15T14:18:02.971Z to a number the scheduler can use
    if (!title || !due || !timezone) {
      throw new Error("Title, due date, and timezone are required");
    }

    const dueDate = new Date(due);
    if (isNaN(dueDate.getTime())) {
      throw new Error(`Invalid due date: ${due}`);
    }

    const id = await ctx.db.insert("tasks", {
      title,
      due,
      timezone,
      status: status || "scheduled",
      source: source || "manual",
      userId: userId || undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Use the provided reminderMinutesBefore or default to 5 minutes
    const minutesBefore = reminderMinutesBefore !== undefined ? reminderMinutesBefore : 5;

    // Log the original values for debugging
    console.log(`[DEBUG] Original due date (ISO): ${due}`);
    console.log(`[DEBUG] User timezone: ${timezone}`);
    console.log(`[DEBUG] Parsed due date (UTC): ${dueDate.toISOString()}`);

    // Function to get timezone offset in milliseconds for a specific timezone
    function getTimezoneOffset(dateStr: string, timeZone: string): number {
      // Create a date formatter that will output dates in the specified timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      // Parse the original date
      const date = new Date(dateStr);

      // Format the date in the target timezone
      const parts = formatter.formatToParts(date);

      // Extract components from the formatted parts
      const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
      const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1; // 0-based
      const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
      const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const tzSecond = parseInt(parts.find(p => p.type === 'second')?.value || '0');

      // Create a new date with the timezone-adjusted components
      const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond));

      // Calculate the offset (UTC time - timezone time)
      return date.getTime() - tzDate.getTime();
    }

    // Calculate the timezone offset
    const timezoneOffset = getTimezoneOffset(due, timezone);
    console.log(`[DEBUG] Timezone offset for ${timezone}: ${timezoneOffset} ms (${timezoneOffset / (60 * 60 * 1000)} hours)`);

    // Adjust the reminder time based on the user's timezone
    // 1. Convert the UTC due date to the user's local time by applying the offset
    // 2. Calculate the reminder time by subtracting minutes
    // 3. Convert back to UTC for scheduling
    const adjustedDueDate = new Date(dueDate.getTime() - timezoneOffset);
    const localReminderTime = adjustedDueDate.getTime() - minutesBefore * 60 * 1000;
    const timeOfReminderCall = new Date(localReminderTime + timezoneOffset).getTime();

    console.log(`[DEBUG] Adjusted due date in user's timezone: ${new Date(adjustedDueDate).toISOString()}`);
    console.log(`[DEBUG] Local reminder time: ${new Date(localReminderTime).toISOString()}`);
    console.log(`[DEBUG] Final UTC reminder time: ${new Date(timeOfReminderCall).toISOString()}`);

    const callArgs = {
      taskId: id,
      userId: userId,
    };
    const jobId = await ctx.scheduler.runAt(timeOfReminderCall, internal.tasks.runScheduledReminder, callArgs);
    console.log(`Scheduled reminder for task ${id} at ${new Date(timeOfReminderCall).toLocaleTimeString()} UTC (${new Date(localReminderTime).toLocaleTimeString()} user local time) with job ID ${jobId}, ${minutesBefore} minutes before due time`);


  },
});

// get a task by id
export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    return await ctx.db.get(taskId);
  },
});

export const runScheduledReminder = internalMutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, { taskId, userId }) => {
    console.log(`Running scheduled reminder for task ${taskId}`);
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }


    if (task.status !== "scheduled") throw new Error(`Task with ID ${taskId} is not scheduled`);

    // if the task was moved later, skip, remember the reminder is run 5 minutes before the due time
    // We need to account for timezone when checking if the task is due
    function getTimezoneOffset(dateStr: string, timeZone: string): number {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      const date = new Date(dateStr);
      const parts = formatter.formatToParts(date);

      const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
      const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
      const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
      const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const tzSecond = parseInt(parts.find(p => p.type === 'second')?.value || '0');

      const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond));

      return date.getTime() - tzDate.getTime();
    }

    const timezoneOffset = getTimezoneOffset(task.due, task.timezone);
    const dueTimeInUserTimezone = new Date(task.due).getTime() - timezoneOffset;

    console.log(`[DEBUG] Task due time in UTC: ${new Date(task.due).toISOString()}`);
    console.log(`[DEBUG] Task due time in user timezone (${task.timezone}): ${new Date(dueTimeInUserTimezone).toISOString()}`);
    console.log(`[DEBUG] Current time: ${new Date().toISOString()}`);
    console.log(`[DEBUG] Timezone offset: ${timezoneOffset / (60 * 60 * 1000)} hours`);

    if (dueTimeInUserTimezone > Date.now() + 6 * 60 * 1000) {
      console.log(`Task ${taskId} is not due yet in user's timezone, skipping reminder`);
    }
    if (!task.userId) throw new Error(`Task with ID ${taskId} has no user assigned`);

    // get user from task if userId exists
    const user = await ctx.db.get(task.userId);
    if (!user) throw new Error(`User with ID ${task.userId} not found`);
    if (!user.phone) throw new Error(`User with ID ${task.userId} has no phone number`);
    // flip the state
    await ctx.db.patch(taskId, {
      status: "calling",
      updatedAt: Date.now(),
    });

    // call the action to send the reminder using eleven labs
    await ctx.scheduler.runAfter(
      0, // 0 is for now
      api.core.calls.actions.initiateReminderCall,
      {
        userId: userId,
        toNumber: user.phone,
        userName: user.name,
        taskName: task.title,
        taskTime: task.due,
        taskId: task._id,
      }
    );

    return { success: true };
  },
});
