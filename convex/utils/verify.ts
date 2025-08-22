
"use node";

import crypto from "crypto";
import { action } from "../_generated/server";
import { v } from "convex/values";

/** Parse ElevenLabs-Signature header: "t=1699999999,v0=abcdef..." */
function parseSigHeader(sigHeader: string | null): { tsStr: string; provided: string } | null {
  if (!sigHeader) return null;
  const parts = sigHeader.split(",").map((s) => s.trim());
  const tPart = parts.find((p) => p.startsWith("t="));
  const v0Part = parts.find((p) => p.startsWith("v0="));
  if (!tPart || !v0Part) return null;
  return { tsStr: tPart.slice(2), provided: v0Part };
}

/** Compute "v0=" + HMAC_SHA256(secret, `${timestamp}.${body}`) as hex */
function computeExpected(secret: string, tsStr: string, bodyText: string): string {
  const message = `${tsStr}.${bodyText}`;
  const hmac = crypto.createHmac("sha256", secret).update(message).digest("hex");
  return `v0=${hmac}`;
}

/** Constant-time compare using Node buffers */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

/** Core verify function (Node) */
export async function verifyElevenLabsWebhookNode(opts: {
  bodyText: string;
  sigHeader: string | null;
  secret: string | undefined;
  toleranceSec?: number; // default 1800
  nowMs?: number;
}): Promise<{ valid: boolean; reason?: string; timestamp?: number }> {
  const { bodyText, sigHeader, secret, toleranceSec = 1800, nowMs } = opts;

  if (!secret) return { valid: false, reason: "Missing ELEVENLABS_CONVAI_WEBHOOK_SECRET" };

  const parsed = parseSigHeader(sigHeader);
  if (!parsed) return { valid: false, reason: "Invalid or missing ElevenLabs-Signature header" };

  const { tsStr, provided } = parsed;
  const tsSec = Number(tsStr);
  if (!Number.isFinite(tsSec)) return { valid: false, reason: "Invalid timestamp" };

  const now = nowMs ?? Date.now();
  const oldest = now - toleranceSec * 1000;
  const reqMs = tsSec * 1000;
  if (reqMs < oldest) return { valid: false, reason: "Request expired" };

  const expected = computeExpected(secret, tsStr, bodyText);
  if (!timingSafeEqualStr(expected, provided)) {
    return { valid: false, reason: "Signature mismatch" };
  }
  return { valid: true, timestamp: tsSec };
}

/**
 * Action wrapper so edge-only http.ts can call into Node to do HMAC safely.
 * Returns { valid, reason?, timestamp? } and never throws.
 */
export const verifyElevenLabsSignature = action({
  args: {
    bodyText: v.string(),
    sigHeader: v.optional(v.string()),
    toleranceSec: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
    return verifyElevenLabsWebhookNode({
      bodyText: args.bodyText,
      sigHeader: args.sigHeader ?? null,
      secret,
      toleranceSec: args.toleranceSec ?? 1800,
    });
  },
});