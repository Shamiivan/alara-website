// stripe.ts

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import Stripe from "stripe";
import { getAuthUserId } from "@convex-dev/auth/server";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const pay = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const currUser = (await ctx.runQuery(api.user.getCurrentUser, {})) as { _id: string; email?: string } | null;

    const email = currUser?.email;
    if (!currUser) throw new Error("User record not found in database");


    const domain = process.env.SITE_URL;
    if (!domain) throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error("Missing STRIPE_ONE_TIME_PRICE_ID environment variable");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        userId: currUser._id,
      },
      success_url: `${domain}/?success=true`,
      cancel_url: `${domain}/?canceled=true`,
    });

    // 5. Return the redirect URL
    return session.url;
  },
});
