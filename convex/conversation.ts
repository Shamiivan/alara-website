import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";

export const getConversationByCallId = query({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    try {
      // Get the authenticated user ID
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return null;
      }

      // Verify the call belongs to the user
      const call = await ctx.db.get(args.callId);
      if (!call || call.userId !== userId) {
        return null;
      }

      // Get the conversation
      const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_call", (q) => q.eq("callId", args.callId))
        .unique();

      return conversation;
    } catch (error) {
      console.error("[getConversationByCallId] Error:", error);
      return null;
    }
  },
});