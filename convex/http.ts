import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { get } from "http";
import { JwtPayload } from "./types/google";
import { use } from "react";
import { elevenLabsRoutes } from "./integrations/elevenlabs/http";

const http = httpRouter();
auth.addHttpRoutes(http);

elevenLabsRoutes(http);

http.route({
  path: "/api/gcal/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      const client_id = process.env.AUTH_GOOGLE_ID!;
      const client_secret = process.env.AUTH_GOOGLE_SECRET!;
      const redirect_uri = process.env.CONVEX_URL!;
      const origin = process.env.SITE_URL!;

      if (!code || error) throw new Error("Invalid Google Calendar callback there is no code or another error");
      if (!client_id) throw new Error("Missing Google client ID");
      if (!client_secret) throw new Error("Missing Google client secret");
      if (!redirect_uri) throw new Error("Missing Google redirect URI");

      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: client_id,
          client_secret: client_secret,
          redirect_uri: redirect_uri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResp.json() as {
        access_token?: string;
        refresh_token?: string;
        id_token?: string;
        expires_in?: number;
        scope?: string;
      };
      //decode jwt
      const parts = tokens.id_token?.split('.');
      if (parts?.length !== 3) throw new Error("Invalid JWT");
      const base64 = parts[1].replace("/-/", "+").replace("/_/", "/"); // decode base64
      const json = decodeURIComponent(atob(base64).split("")
        .map(char => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join("")
      );

      const payload: JwtPayload = JSON.parse(json);
      console.log("JWT payload:", payload);
      // const res = await ctx.runAction(api.google.handleGoogleCallback, {
      //   code
      // });

      if (!payload.email) throw new Error("No email in id_token payload");
      const user = await ctx.runQuery(api.user.getUserByEmail, {
        email: payload.email
      });

      if (!user) throw new Error("User not found");
      if (!tokens.access_token) throw new Error("No access token received from Google");
      if (!tokens.refresh_token) throw new Error("No refresh token received from Google");
      if (!user._id) throw new Error("User has no ID");

      await ctx.runMutation(api.google.upsertTokens, {
        userId: user._id,
        userEmail: payload.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAtMs: Date.now() + (tokens.expires_in || 3600) * 1000
      });

      // redirected to the dashboard
      const returnUrl = new URL("/settings?gcal=connected", process.env.SITE_URL!);
      return Response.redirect(returnUrl);


    } catch (error) {
      console.error("Error in Google Calendar callback:", error);
      return new Response("Internal err during OAuth callback.", { status: 500 });
    }
  })
});



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
