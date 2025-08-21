import { mutation, query } from "../_generated/server"
import { v } from "convex/values"
import { Flag } from "../types/flags"

export const getFeatureFlagsByUser = query({
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
    flags: v.record(v.string(), v.union(v.boolean(), v.string(), v.number())),
    key: v.string(),
    value: v.union(v.boolean(), v.string(), v.number()),
  },
  handler: async ({ db }, { key, value, userId, flags }) => {
    // check if there is an existing row and update it if not add a new one
    const row = await db.query("featureFlags")
      .withIndex("by_user", (q) => q.eq("userId", userId)).unique()

    if (row) {
      // add the new flags to the existing row
      return await db.patch(row._id, { flags: { ...row.flags, [key]: value }, updatedAt: Date.now() });
    } else {
      return await db.insert("featureFlags", { userId, flags, createdAt: Date.now(), updatedAt: Date.now() });
    }
  }
});