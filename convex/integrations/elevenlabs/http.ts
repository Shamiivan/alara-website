import { httpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { api } from "../../_generated/api";

export function elevenLabsRoutes(http: ReturnType<typeof httpRouter>) {
  http.route({
    path: "/api/convai/webhook",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
      try {
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
}