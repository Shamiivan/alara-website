// stripe.ts

import { action, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const pay = action({
  args: {},
  handler: async (ctx) => {
    console.log("[Stripe.ts] Paying  ")

    const domain = process.env.SITE_URL ?? "http://localhost:3000";
    const amount = 0;

    const paymentId: Id<"payments"> = await ctx.runMutation(internal.payments.create, { amount: amount });
    // if (!priceId) throw new Error("Missing STRIPE_ONE_TIME_PRICE_ID environment variable");

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "USD",
            unit_amount: amount,
            tax_behavior: "exclusive",
            product_data: {
              name: "One message of your choosing",
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${domain}?paymentId=${paymentId}`,
      cancel_url: `${domain}`,
      automatic_tax: { enabled: true },
    });

    await ctx.runMutation(internal.payments.markPending, {
      paymentId,
      stripeId: session.id,
    });

    return session.url;
  },
});

