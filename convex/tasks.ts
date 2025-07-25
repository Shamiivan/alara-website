import { query } from "./_generated/server"

export const get_tasks = query({
  args: {},
  handler: async (ctx) => {
    console.log("We get the tasks");
    // return await ctx.db.query("tasks").collect();
  },
})