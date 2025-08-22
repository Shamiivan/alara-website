"use node"
// convex/lib/crypto.ts
import { createDecipheriv, createCipheriv, randomBytes } from "crypto";

function loadKey(): Buffer {
  const raw = process.env.GOOGLE_TOKEN_ENC_KEY ?? "";
  const b64 = raw.startsWith("base64:") ? raw.slice(7) : raw;
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("GOOGLE_TOKEN_ENC_KEY must be 32 bytes (base64)");
  return key;
}

export function encrypt(plaintext: string): string {
  const key = loadKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64"); // iv(12) + tag(16) + data
}

export function decrypt(b64: string): string {
  const key = loadKey();
  const raw = Buffer.from(b64, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
