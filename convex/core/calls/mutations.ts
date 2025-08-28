// convex/calls.mutations.ts
import { mutation } from "./../../_generated/server";
import { v } from "convex/values";

/** -------- Types / helpers -------- */
const CallStatus = v.union(
  v.literal("initiated"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("no_answer"),
);

// Basic state machine: forward-only transitions.
const allowedTransitions: Record<string, Array<"in_progress" | "completed" | "failed" | "no_answer">> = {
  initiated: ["in_progress", "completed", "failed", "no_answer"],
  in_progress: ["completed", "failed", "no_answer"],
  completed: [],
  failed: [],
  no_answer: [],
};

function assertTransition(from: any, to: any) {
  const allowed = allowedTransitions[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid call status transition: ${from} -> ${to}`);
  }
}

/** -------- CREATE -------- */

/**
 * Create a new call log entry in 'initiated' state.
 */
export const createCallRecord = mutation({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    purpose: v.optional(v.string()),
    agentId: v.optional(v.string()),
    agentPhoneNumberId: v.optional(v.string()),
    conversationId: v.optional(v.string()), // if preallocated on provider
    elevenLabsCallId: v.optional(v.string()), // if already known
    twilioCallSid: v.optional(v.string()),
    startTimeUnix: v.optional(v.number()), // provider start unix (secs) if available
  },
  handler: async (ctx, args) => {
    const doc = {
      userId: args.userId,
      toNumber: args.toNumber,
      purpose: args.purpose,
      status: "initiated" as const,
      elevenLabsCallId: args.elevenLabsCallId,
      agentId: args.agentId,
      agentPhoneNumberId: args.agentPhoneNumberId,
      conversationId: args.conversationId,
      twilioCallSid: args.twilioCallSid,
      hasTranscript: false,
      hasAudio: false,
      startTimeUnix: args.startTimeUnix,
      initiatedAt: Date.now(),
      // unset fields
      duration: undefined,
      cost: undefined,
      completedAt: undefined,
      errorMessage: undefined,
    };
    const callId = await ctx.db.insert("calls", doc);
    return callId;
  },
});

/** -------- UPSERT BY ELEVEN LABS ID (Idempotent for webhooks) -------- */

/**
 * Ensure there is a call row keyed by elevenLabsCallId.
 * If exists, returns it; otherwise creates 'initiated'.
 */
export const upsertCallByElevenLabsId = mutation({
  args: {
    elevenLabsCallId: v.string(),
    userId: v.id("users"),
    toNumber: v.string(),
    purpose: v.optional(v.string()),
    agentId: v.optional(v.string()),
    conversationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("calls")
      .withIndex("by_eleven_labs_call_id", q =>
        q.eq("elevenLabsCallId", args.elevenLabsCallId)
      )
      .unique();

    if (existing) return existing._id;

    const callId = await ctx.db.insert("calls", {
      userId: args.userId,
      toNumber: args.toNumber,
      purpose: args.purpose,
      status: "initiated" as const,
      elevenLabsCallId: args.elevenLabsCallId,
      agentId: args.agentId,
      conversationId: args.conversationId,
      initiatedAt: nowMs(),
    });

    return callId;
  },
});

/** -------- STATUS TRANSITIONS -------- */

export const markInProgress = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, { callId }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error("Call not found");
    assertTransition(call.status, "in_progress");
    await ctx.db.patch(callId, { status: "in_progress" as const });
  },
});

export const markCompleted = mutation({
  args: {
    callId: v.id("calls"),
    duration: v.optional(v.number()), // in seconds or ms (your convention)
    cost: v.optional(v.number()),     // cents or unit cost
  },
  handler: async (ctx, { callId, duration, cost }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error("Call not found");
    assertTransition(call.status, "completed");
    await ctx.db.patch(callId, {
      status: "completed" as const,
      errorMessage: undefined,
    });
  },
});

export const markFailed = mutation({
  args: {
    callId: v.id("calls"),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { callId, errorMessage }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error("Call not found");
    assertTransition(call.status, "failed");
    await ctx.db.patch(callId, {
      status: "failed" as const,
      errorMessage,
    });
  },
});

export const markNoAnswer = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, { callId }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error("Call not found");
    assertTransition(call.status, "no_answer");
    await ctx.db.patch(callId, {
      status: "no_answer" as const,
      errorMessage: undefined,
    });
  },
});

/** -------- ATTACH / PATCH PROVIDER IDS & FLAGS -------- */

export const attachElevenLabsId = mutation({
  args: { callId: v.id("calls"), elevenLabsCallId: v.string() },
  handler: async (ctx, { callId, elevenLabsCallId }) => {
    await ctx.db.patch(callId, { elevenLabsCallId });
  },
});

export const setAgentInfo = mutation({
  args: {
    callId: v.id("calls"),
    agentId: v.optional(v.string()),
    agentPhoneNumberId: v.optional(v.string()),
    conversationId: v.optional(v.string()),
  },
  handler: async (ctx, { callId, agentId, conversationId }) => {
    await ctx.db.patch(callId, { agentId, conversationId });
  },
});



/** -------- GENERIC PATCH (guarded) -------- */

/**
 * Small, guarded patch for selected fields (keeps surface stable).
 * Extend `allowedFields` as needed.
 */
export const patchCall = mutation({
  args: {
    callId: v.id("calls"),
    data: v.object({
      purpose: v.optional(v.string()),
      toNumber: v.optional(v.string()),
      startTimeUnix: v.optional(v.number()),
      status: v.optional(CallStatus), // only if you want to bypass the transition helpers
      errorMessage: v.optional(v.string()),
      agentId: v.optional(v.string()),
      agentPhoneNumberId: v.optional(v.string()),
      conversationId: v.optional(v.string()),
      elevenLabsCallId: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { callId, data }) => {
    // If status is set here, validate transition
    if (data.status) {
      const current = await ctx.db.get(callId);
      if (!current) throw new Error("Call not found");
      assertTransition(current.status, data.status);
      if (["completed", "failed", "no_answer"].includes(data.status)) {
        data.completedAt ??= nowMs();
      }
    }
    await ctx.db.patch(callId, data);
  },
});
