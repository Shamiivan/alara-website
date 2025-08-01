import { v } from "convex/values"
import { api } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"


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