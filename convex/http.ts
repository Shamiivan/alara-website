import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

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


http.route({
  path: "/api/convai/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      // 1) Read raw body (must do this before any .json() usage)
      const bodyText = await req.text();
      const data = JSON.parse(bodyText).data;
      await ctx.runAction(api.calls_node.handleElevenLabsWebhookTemp, {
        payload: data,
      });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
      console.error("Error in ConvAI webhook:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;
