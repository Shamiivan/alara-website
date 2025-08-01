import { query } from "./_generated/server"

export const get_tasks = query({
  args: {},
  handler: async (ctx) => {
    // return await ctx.db.query("tasks").collect();
  },
})