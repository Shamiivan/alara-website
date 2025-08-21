import { mutation, query } from "../_generated/server"
import { v } from "convex/values"

export const get = query({
  args: {
    userId: v.id("users"),
  },
  handler: async ({ db }, { userId }) => {
    const row = await db.query("featureFlags")
      .withIndex("by_user", (q) => q.eq("userId", userId)).unique()
    return row?.flags ?? { calendar_v1: false }
  },
})

export const upsert = mutation({
  args: {
    userId: v.id("users"),
    flags: v.object({
      calendar_v1: v.boolean(),
    }),
  },
  handler: async ({ db }, { userId, flags }) => {
    // check if there is an existing row and update it if not add a new one
    const row = await db.query("featureFlags")
      .withIndex("by_user", (q) => q.eq("userId", userId)).unique()
    if (row) {
      return await db.patch(row._id, { flags, updatedAt: Date.now() });
    } else {
      return await db.insert("featureFlags", { userId, flags, createdAt: Date.now(), updatedAt: Date.now() });
    }
  }
});