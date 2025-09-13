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