import { v } from "convex/values"
import { api } from "./_generated/api"
import { internalMutation, query } from "./_generated/server"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import { Id } from "./_generated/dataModel"


export const create = internalMutation({
  args: {
    amount: v.number()
  },
  handler: async (ctx, args) => {
    // Get the user idetity
    // const currUser = await ctx.runQuery(api.user.getCurrentUser);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User is not authenticated");
    // create the user 
    const paymentId = await ctx.db.insert(
      "payments", {
      userId: userId,
      amount: args.amount,
      createdAt: Date.now()
    });
    return paymentId;
  }
});

export const markPending = internalMutation({
  args: {
    paymentId: v.id("payments"),
    stripeId: v.string(),
  },
  handler: async (ctx, args_0) => {
    await ctx.db.patch(args_0.paymentId, {
      stripeId: args_0.stripeId
    });
  },
});

// Get a payment by ID
export const getPayment = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

// Mark a payment as completed
export const markCompleted = internalMutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      completedAt: Date.now(),
      status: "completed",
    });
  },
});

// Mark a payment as failed
export const markFailed = internalMutation({
  args: {
    paymentId: v.id("payments"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: "failed",
      errorMessage: args.errorMessage,
    });
  },
});