// app/api/gcal/callback/route.ts  (GET)
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { api } from "@/../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs"; // Next App Router helper
// import removed - unused
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // get user id
    const token = await convexAuthNextjsToken();
    if (!token) throw new Error("No token found");
    const user = await fetchQuery(api.user.getCurrentUser, {}, { token });

    if (!user) throw new Error("No user found");

    const code = new URL(req.url).searchParams.get("code");
    if (!code) throw new Error("No code provided in request");

    const oauth = new google.auth.OAuth2(
      process.env.GCAL_CLIENT_ID!,
      process.env.GCAL_CLIENT_SECRET!,
      process.env.GCAL_REDIRECT_URI!
    );

    const { tokens } = await oauth.getToken(code);
    // tokens: { access_token, refresh_token, expiry_date, scope }

    if (!tokens.expiry_date) throw new Error("No expiry date on token");
    if (!tokens.access_token) throw new Error("No access token on token");

    if (!tokens.refresh_token) {
      console.warn("No refresh token on token; user may have previously authorized.");
    }
    if (!user._id) throw new Error("No user ID found");
    if (!user.email) throw new Error("No email found for user");

    await fetchMutation(
      api.calendar.upsertTokens,
      {
        userId: user._id,                                 // convex user id
        userEmail: user.email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || "",         // may be undefined on repeats
        expiresAtMs: tokens.expiry_date,
      },
    );

    return NextResponse.redirect("/settings?gcal=connected");

  } catch (error) {
    console.error("Error handling Google Calendar callback:", error);
    return NextResponse.error();
  }
}
