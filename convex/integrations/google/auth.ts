"use node"
import { GoogleTokenRefreshRequest, GoogleTokenResponse } from "./types";

// integrations/google/auth.ts
export async function refreshAccessToken(request: GoogleTokenRefreshRequest): Promise<GoogleTokenResponse> {
  try {
    const clientId = process.env.AUTH_GOOGLE_ID;
    const cliendSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId) throw new Error("Invalid Client Id");
    if (!cliendSecret) throw new Error("Invalid Client Secret");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: cliendSecret,
        refresh_token: request.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token refresh failed: ${response.status} - ${errorText}`);
    }

    return await response.json() as GoogleTokenResponse;
  } catch (error) {
    throw new Error(`Failed to refresh Google access token: ${error instanceof Error ? error.message : String(error)}`);
  }
}