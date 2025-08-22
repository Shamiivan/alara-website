// app/api/gcal/auth/route.ts  (GET)
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const oauth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.SITE_URL! + "/api/gcal/callback"
    );

    const url = oauth.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",                 // ensures a refresh_token the first time
      include_granted_scopes: true,      // incremental auth
      scope: [
        "openid", "email", "profile",
        "https://www.googleapis.com/auth/calendar.readonly",
      ],
    });

    return NextResponse.redirect(url);

  } catch (error) {
    console.error("Error generating Google Calendar auth URL:", error);
    return NextResponse.error();
  }
}
