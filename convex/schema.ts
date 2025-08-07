// schema.ts
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

    phone: v.optional(v.string()),
    isOnboarded: v.optional(v.boolean()),
    callTime: v.optional(v.string()),
    wantsCallReminders: v.optional(v.boolean()),
    wantsClarityCalls: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),

    // Payment fields
    hasPaid: v.optional(v.boolean()),
    paidAt: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("email", ["email"])
    .index("by_phone", ["phone"]),

  calls: defineTable({
    userId: v.id("users"),
    toNumber: v.string(),
    status: v.union(
      v.literal("initiated"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("no_answer")
    ),
    elevenLabsCallId: v.optional(v.string()),
    duration: v.optional(v.number()),
    cost: v.optional(v.number()),
    initiatedAt: v.number(),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    userId: v.id("users"),
    stripeId: v.optional(v.string()),
    amount: v.number(), // counted in cents
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    )),
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_stripeId", ["stripeId"]),

  // Table for tracking processed Stripe webhook events (for idempotency)
  stripeEvents: defineTable({
    eventId: v.string(),
    processedAt: v.number(),
    eventType: v.string(),
    status: v.union(v.literal("success"), v.literal("error")),
    errorMessage: v.optional(v.string()),
  }).index("by_eventId", ["eventId"]),

  // Event logging table (errors only)
  events: defineTable({
    // Core event data
    category: v.string(), // "auth", "onboarding", "payment", "calls", "api", "system"
    type: v.literal("error"), // Only storing errors in DB
    message: v.string(),
    details: v.optional(v.any()), // JSON object with error details, stack trace, etc.

    // User context
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),

    // Request context
    url: v.optional(v.string()),
    userAgent: v.optional(v.string()),

    // Metadata
    timestamp: v.number(),
    source: v.string(), // "client", "server", "middleware", "api", "convex"

    // User-facing features
    showToUser: v.optional(v.boolean()), // Whether to display error to user
    userMessage: v.optional(v.string()), // User-friendly error message
    resolved: v.optional(v.boolean()), // For error tracking
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_timestamp", ["timestamp"])
    .index("by_source", ["source"])
    .index("by_user_unresolved", ["userId", "resolved"]),
});

export default schema;