// stripe.ts

import { action, internalMutation, internalAction, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// Create a payment and Stripe checkout session
export const pay = action({
  args: {},
  handler: async (ctx) => {
    console.log("[Stripe.ts] Creating payment");

    const domain = process.env.SITE_URL ?? "http://localhost:3000";
    const amount = 800; // $8.00 CAD in cents

    // Create a payment record in the database
    const paymentId: Id<"payments"> = await ctx.runMutation(internal.payments.create, {
      amount: amount
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "CAD",
            unit_amount: amount,
            tax_behavior: "exclusive",
            product_data: {
              name: "Alara - One Month Access",
              description: "Try the product for one month"
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${domain}/dashboard?payment=success&paymentId=${paymentId}`,
      cancel_url: `${domain}/payment?payment=cancelled`,
      automatic_tax: { enabled: true },
    });

    // Mark the payment as pending with the Stripe session ID
    await ctx.runMutation(internal.payments.markPending, {
      paymentId,
      stripeId: session.id,
    });

    return session.url;
  },
});

// Get a stripe event by ID
export const getStripeEvent = query({
  args: {
    eventId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stripeEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
  },
});

// Record a stripe event for idempotency
export const recordStripeEvent = internalMutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    status: v.union(v.literal("success"), v.literal("error")),
    errorMessage: v.optional(v.string()),
    processedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stripeEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      status: args.status,
      errorMessage: args.errorMessage,
      processedAt: args.processedAt,
    });
  },
});

// Get a payment by Stripe ID
export const getPaymentByStripeId = query({
  args: {
    stripeId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_stripeId", (q) => q.eq("stripeId", args.stripeId))
      .unique();
  },
});

// Webhook handler for Stripe events
export const fulfill = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Processing Stripe webhook");

    // 1. Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        args.payload,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      console.error("payload", args.payload);
      return { success: false, error: "Invalid signature" };
    }

    console.log(`Received event: ${event.type}`);

    // 2. Check for idempotency (has this event been processed before?)
    const existingEvent = await ctx.runQuery(api.stripe.getStripeEvent, {
      eventId: event.id,
    });

    if (existingEvent) {
      console.log(`Event ${event.id} already processed`);
      // Event already processed, return success to avoid retries
      return { success: true, message: "Event already processed" };
    }

    // 3. Process the event based on its type
    try {
      if (event.type === "checkout.session.completed") {
        await handleCheckoutSessionCompleted(ctx, event);
      } else if (event.type === "payment_intent.succeeded") {
        await handlePaymentIntentSucceeded(ctx, event);
      } else if (event.type === "payment_intent.payment_failed") {
        await handlePaymentIntentFailed(ctx, event);
      } else {
        // Unhandled event type, record but don't process
        console.log(`Unhandled event type: ${event.type}`);
        await ctx.runMutation(internal.stripe.recordStripeEvent, {
          eventId: event.id,
          eventType: event.type,
          status: "success",
          processedAt: Date.now(),
        });
        return { success: true, message: "Unhandled event type" };
      }

      // Record successful event processing
      await ctx.runMutation(internal.stripe.recordStripeEvent, {
        eventId: event.id,
        eventType: event.type,
        status: "success",
        processedAt: Date.now(),
      });

      console.log(`Successfully processed event: ${event.type}`);
      return { success: true };
    } catch (error: any) {
      console.error(`Error processing event ${event.id}:`, error.message);

      // Record failed event processing
      await ctx.runMutation(internal.stripe.recordStripeEvent, {
        eventId: event.id,
        eventType: event.type,
        status: "error",
        errorMessage: error.message,
        processedAt: Date.now(),
      });

      return { success: false, error: error.message };
    }
  },
});

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(
  ctx: any,
  event: any
) {
  const session = event.data.object;
  console.log(`Processing session: ${session.id}`);

  // Find the payment by stripeId
  const payment = await ctx.runQuery(api.stripe.getPaymentByStripeId, {
    stripeId: session.id,
  });

  if (!payment) {
    console.error(`Payment not found for session ID: ${session.id}`);
    throw new Error(`Payment not found for Stripe session ID: ${session.id}`);
  }

  // Fulfill the payment
  await fulfillPayment(ctx, payment._id);
}

// Handle payment_intent.succeeded event
async function handlePaymentIntentSucceeded(
  ctx: any,
  event: any
) {
  const paymentIntent = event.data.object;
  console.log(`Processing payment intent: ${paymentIntent.id}`);

  // Find the payment by stripeId
  const payment = await ctx.runQuery(api.stripe.getPaymentByStripeId, {
    stripeId: paymentIntent.id,
  });

  if (!payment) {
    console.error(`Payment not found for payment intent ID: ${paymentIntent.id}`);
    throw new Error(`Payment not found for Stripe payment intent ID: ${paymentIntent.id}`);
  }

  // Fulfill the payment
  await fulfillPayment(ctx, payment._id);
}

// Handle payment_intent.payment_failed event
async function handlePaymentIntentFailed(
  ctx: any,
  event: any
) {
  const paymentIntent = event.data.object;
  console.log(`Processing failed payment intent: ${paymentIntent.id}`);

  // Find the payment by stripeId
  const payment = await ctx.runQuery(api.stripe.getPaymentByStripeId, {
    stripeId: paymentIntent.id,
  });

  if (!payment) {
    console.error(`Payment not found for payment intent ID: ${paymentIntent.id}`);
    throw new Error(`Payment not found for Stripe payment intent ID: ${paymentIntent.id}`);
  }

  // Mark payment as failed
  await ctx.runMutation(internal.payments.markFailed, {
    paymentId: payment._id,
    errorMessage: paymentIntent.last_payment_error?.message || "Payment failed",
  });
}

// Fulfill a successful payment
async function fulfillPayment(ctx: any, paymentId: any) {
  console.log(`Fulfilling payment: ${paymentId}`);

  // 1. Get the payment
  const payment = await ctx.runQuery(api.payments.getPayment, {
    paymentId,
  });

  if (!payment) {
    console.error(`Payment not found with ID: ${paymentId}`);
    throw new Error(`Payment not found with ID: ${paymentId}`);
  }

  // 2. Update the payment with completedAt
  await ctx.runMutation(internal.payments.markCompleted, {
    paymentId: payment._id,
  });

  // 3. Update the user's payment status
  await ctx.runMutation(internal.user.markUserPaid, {
    userId: payment.userId,
  });

  console.log(`Successfully fulfilled payment: ${paymentId}`);
  return { paymentId };
}
