// app/api/gcal/auth/route.ts  (GET)
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const redirectUri = process.env.CONVEX_URL! + "/api/gcal/callback";
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    if (!redirectUri) throw new Error("Missing redirect URI");
    if (!clientId) throw new Error("Missing Google client ID");
    if (!clientSecret) throw new Error("Missing Google client secret");

    const oauth = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const url = oauth.generateAuthUrl({
      response_type: "code",
      access_type: "offline",
      prompt: "consent",                 // ensures a refresh_token the first time
      include_granted_scopes: true,      // incremental auth
      scope: [
        "openid", "email", "profile",
        "https://www.googleapis.com/auth/calendar"
      ],
    });

    return NextResponse.redirect(url);

  } catch (error) {
    console.error("Error generating Google Calendar auth URL:", error);
    return NextResponse.error();
  }
}
