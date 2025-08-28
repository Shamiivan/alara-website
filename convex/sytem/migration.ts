// convex/migrations.ts
import { internalMutation } from "./../_generated/server";
import { v } from "convex/values";

export const removeAgentPhoneNumberId = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const calls = await ctx.db.query("calls").collect();

    for (const call of calls) {
      if ("agentPhoneNumberId" in call) {
        // Remove the unwanted field by replacing with a clean object
        const { agentPhoneNumberId, ...cleanCall } = call;
        await ctx.db.replace(call._id, cleanCall);
      }
    }

    console.log(`Cleaned up ${calls.length} call records`);
    return null;
  },
});