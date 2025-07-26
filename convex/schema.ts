import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,

  users: defineTable({
    // Auth library fields
    tokenIdentifier: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),

    // Your custom fields
    phone: v.optional(v.string()),
    isOnboarded: v.optional(v.boolean()),
    callTime: v.optional(v.string()),
    wantsCallReminders: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("email", ["email"])
});

export default schema;