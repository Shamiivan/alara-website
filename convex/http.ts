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
      console.log("Received ConvAI webhook:", bodyText);

      // 2) Verify HMAC in Node via action (http.ts is edge-only)
      const { valid, reason } = await ctx.runAction(
        api.utils.verify.verifyElevenLabsSignature,
        {
          bodyText,
          sigHeader: req.headers.get("ElevenLabs-Signature") ?? undefined,
          toleranceSec: 30 * 60,
        }
      );

      if (!valid) {
        return new Response(JSON.stringify({ error: reason }), { status: 401 });
      }

      // 3) Parse JSON AFTER verifying HMAC
      let evt: any;
      try {
        evt = JSON.parse(bodyText);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
      }

      // 4) Only handle transcription webhooks (ack others)
      if (evt?.type !== "post_call_transcription") {
        return new Response(JSON.stringify({ received: true, ignored: evt?.type }), {
          status: 200,
        });
      }

      const data = evt.data ?? {};
      const conversation_id: string | undefined = data.conversation_id;
      if (!conversation_id) {
        return new Response(JSON.stringify({ error: "Missing conversation_id" }), {
          status: 400,
        });
      }
      console.log("Received ConvAI webhook for conversation:", conversation_id);
      console.log("Full data:", data);

      // 5) Extract fields you care about
      const toSave = {
        conversation_id,
        agent_id: data.agent_id ?? undefined,
        status: data.status ?? undefined,
        user_id_external:
          data.user_id ??
          data?.conversation_initiation_client_data?.dynamic_variables?.user_id ??
          undefined,
        start_time_unix_secs: data?.metadata?.start_time_unix_secs ?? undefined,
        call_duration_secs: data?.metadata?.call_duration_secs ?? undefined,
        extra: {
          has_audio: data.has_audio ?? undefined,
          has_user_audio: data.has_user_audio ?? undefined,
          has_response_audio: data.has_response_audio ?? undefined,
        },
      };
      console.log(toSave);

      await ctx.runAction(api.calls_node.handleElevenLabsWebhookTemp, {
        conversationData: data,
      });

      // 6) Persist in your DB
      // await ctx.runMutation(api.calls.upsertFromWebhook, toSave);

      // 7) Success (required by ElevenLabs)
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
      console.error("Error in ConvAI webhook:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;
