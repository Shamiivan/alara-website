import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

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
    status: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { title, due, timezone, status, source } = args;
    const now = Date.now();

    const id = await ctx.db.insert("tasks", {
      title,
      due,
      timezone,
      status: status || "scheduled",
      source: source || "manual",
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});