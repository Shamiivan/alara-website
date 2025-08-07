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
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        console.warn("[payments.create] User not authenticated");
        throw new Error("User is not authenticated");
      }

      console.log("[payments.create] Creating payment for userId:", userId, "amount:", args.amount);

      const paymentId = await ctx.db.insert("payments", {
        userId: userId,
        amount: args.amount,
        createdAt: Date.now()
      });

      console.log("[payments.create] Payment created successfully:", paymentId);
      return paymentId;
    } catch (error) {
      console.error("[payments.create] Error:", error);

      // Log error to events table
      try {
        await ctx.runMutation(api.events.logErrorInternal, {
          category: "payment",
          message: `Payment creation failed: ${error instanceof Error ? error.message : String(error)}`,
          details: {
            amount: args.amount,
            error: error instanceof Error ? error.stack : String(error),
          },
          source: "convex",
        });
      } catch (logError) {
        console.error("[payments.create] Failed to log error:", logError);
      }

      throw error;
    }
  }
});

export const markPending = internalMutation({
  args: {
    paymentId: v.id("payments"),
    stripeId: v.string(),
  },
  handler: async (ctx, args_0) => {
    try {
      await ctx.db.patch(args_0.paymentId, {
        stripeId: args_0.stripeId
      });

      console.log("[payments.markPending] Payment marked as pending:", args_0.paymentId);
    } catch (error) {
      console.error("[payments.markPending] Error:", error);
      throw error;
    }
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
    try {
      await ctx.db.patch(args.paymentId, {
        completedAt: Date.now(),
        status: "completed",
      });

      console.log("[payments.markCompleted] Payment completed:", args.paymentId);
    } catch (error) {
      console.error("[payments.markCompleted] Error:", error);

      // Log error to events table
      try {
        await ctx.runMutation(api.events.logErrorInternal, {
          category: "payment",
          message: `Failed to mark payment as completed: ${error instanceof Error ? error.message : String(error)}`,
          details: {
            paymentId: args.paymentId,
            error: error instanceof Error ? error.stack : String(error),
          },
          source: "convex",
        });
      } catch (logError) {
        console.error("[payments.markCompleted] Failed to log error:", logError);
      }

      throw error;
    }
  },
});

// Mark a payment as failed
export const markFailed = internalMutation({
  args: {
    paymentId: v.id("payments"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.paymentId, {
        status: "failed",
        errorMessage: args.errorMessage,
      });

      console.log("[payments.markFailed] Payment failed:", args.paymentId);

      // Log payment failure to events table
      try {
        await ctx.runMutation(api.events.logErrorInternal, {
          category: "payment",
          message: "Payment failed",
          details: {
            paymentId: args.paymentId,
            errorMessage: args.errorMessage,
          },
          source: "convex",
        });
      } catch (logError) {
        console.error("[payments.markFailed] Failed to log error:", logError);
      }

    } catch (error) {
      console.error("[payments.markFailed] Error:", error);
      throw error;
    }
  },
});