"use node"
import { GoogleTokenRequest, GoogleTokenRefreshRequest, GoogleTokenResponse, JwtPayload } from "./types";


export async function exchangeCodeForTokens(request: GoogleTokenRequest): Promise<GoogleTokenResponse> {
  try {
    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId) throw new Error("Missing AUTH_GOOGLE_ID environment variable");
    if (!clientSecret) throw new Error("Missing AUTH_GOOGLE_SECRET environment variable");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: request.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: request.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token exchange failed: ${response.status} - ${errorText}`);
    }

    return await response.json() as GoogleTokenResponse;
  } catch (error) {
    throw new Error(`Failed to exchange code for tokens: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function decodeJWT(token: string): JwtPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error("Invalid JWT format");

    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function refreshAccessToken(request: GoogleTokenRefreshRequest): Promise<GoogleTokenResponse> {
  try {
    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId) throw new Error("Missing AUTH_GOOGLE_ID");
    if (!clientSecret) throw new Error("Missing AUTH_GOOGLE_SECRET");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
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