import { timeStamp } from "console";
import { query, mutation, action, internalAction, internalMutation } from "./../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "./../../_generated/api";
import { Id, Doc } from "../../_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  due: string;
  reminderMinutesBefore?: number;
  timezone: string;
  callId?: Id<"calls">;
  userId?: Id<"users">;
  status?: string;
  source?: string;
  createdAt: number;
  updatedAt: number;
}

export const getTaskForUser = query({
  args: {},
  handler: async (ctx): Promise<Task[] | null> => {
    const currentUser = await ctx.runQuery(api.core.users.queries.getCurrentUser);

    if (!currentUser) {
      return null;
    }
    const tasks = await ctx.db.query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();

    return tasks;
  },
});

export const getAllTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getTasksByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status_due", (q) => q.eq("status", status))
      .collect();
  },
});

export const getUpcomingTasks = query({
  args: {
    userId: v.id("users"),
    hoursAhead: v.optional(v.number())
  },
  handler: async (ctx, { userId, hoursAhead = 24 }) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    const allUserTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by due date in memory since we need to parse ISO strings
    return allUserTasks.filter(task => {
      const dueDate = new Date(task.due);
      return dueDate >= now && dueDate <= futureTime && task.status === "scheduled";
    });
  },
});