import { httpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { api, internal } from "../../_generated/api";
import { exchangeCodeForTokens, decodeJWT } from "./auth";

export function googleRoutes(http: ReturnType<typeof httpRouter>) {
  http.route({
    path: "/api/gcal/callback",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (!code || error) {
          throw new Error("Invalid Google Calendar callback - no code or error present");
        }

        const redirectUri = `${process.env.CONVEX_URL}/api/gcal/callback`;

        if (!redirectUri) throw new Error("Missing CONVEX_URL environment variable");

        // Exchange code for tokens using integration layer
        const tokens = await exchangeCodeForTokens({
          code,
          redirectUri
        });

        if (!tokens.id_token) {
          throw new Error("No id_token received from Google");
        }

        // Decode JWT using integration layer
        const payload = decodeJWT(tokens.id_token);
        console.log("JWT payload:", payload);

        if (!payload.email) {
          throw new Error("No email in id_token payload");
        }

        // Get user and save tokens using core layer
        const user = await ctx.runQuery(api.user.getUserByEmail, {
          email: payload.email
        });

        if (!user) throw new Error("User not found");
        if (!tokens.access_token) throw new Error("No access token received from Google");
        if (!tokens.refresh_token) throw new Error("No refresh token received from Google");

        await ctx.runMutation(api.google.upsertTokens, {
          userId: user._id,
          userEmail: payload.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAtMs: Date.now() + (tokens.expires_in || 3600) * 1000
        });

        // Redirect to success page
        const returnUrl = new URL("/app/dashboard?gcal=connected", process.env.SITE_URL!);
        return Response.redirect(returnUrl);

      } catch (error) {
        console.error("Error in Google Calendar callback:", error);
        return new Response("Internal error during OAuth callback.", { status: 500 });
      }
    })
  });
}