import { mutation, internalMutation } from "../../_generated/server";
import { api } from "../../_generated/api";
import { v } from "convex/values";

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.optional(v.string()),
    title: v.optional(v.string()),
    due: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, { taskId, ...updates }) => {
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return task;
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    await ctx.db.delete(taskId);
    return task;
  },
});

export const insertTask = mutation({
  args: {
    title: v.string(),
    due: v.string(),
    timezone: v.string(),
    status: v.string(),
    source: v.string(),
    userId: v.id("users"),
    callId: v.optional(v.id("calls")),
    duration: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const updateTaskStatus = internalMutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, { taskId, status }) => {
    await ctx.db.patch(taskId, {
      status,
      updatedAt: Date.now(),
    });
  },
});

export const runScheduledReminder = internalMutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, { taskId, userId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    if (task.status !== "scheduled") {
      throw new Error(`Task with ID ${taskId} is not scheduled`);
    }

    // Simple check: is the task due within the next 10 minutes?
    const dueTime = new Date(task.due).getTime();
    const now = Date.now();
    const tenMinutesFromNow = now + (10 * 60 * 1000);

    if (dueTime > tenMinutesFromNow) {
      console.log(`Task ${taskId} not due yet, skipping reminder`);
      return;
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    if (!user.phone) throw new Error(`User with ID ${userId} has no phone number`);

    // Update task status
    await ctx.db.patch(taskId, {
      status: "calling",
      updatedAt: Date.now(),
    });

    // TODO: Schedule the actual reminder call
    await ctx.scheduler.runAfter(0, api.core.calls.actions.initiateReminderCall, {
      userId,
      toNumber: user.phone,
      userName: user.name,
      taskName: task.title,
      taskTime: task.due,
      timezone: user.timezone,
      taskId: task._id,
    });

    return { success: true };
  },
});