import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { get } from "http";
import { JwtPayload } from "./types/google";
import { use } from "react";
import { elevenLabsRoutes } from "./integrations/elevenlabs/http";
import { googleRoutes } from "./integrations/google/https";

const http = httpRouter();
auth.addHttpRoutes(http);

elevenLabsRoutes(http);
googleRoutes(http);




// Add Stripe webhook route
http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", {
        status: 400,
      });
    }

    const payload = await request.text();
    const result = await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload,
    });

    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response(result.error || "Webhook Error", {
        status: 400,
      });
    }
  }),
});


export default http;
