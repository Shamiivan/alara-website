"use node"

export function isExpiredJWT(accessToken: string, skewMs = 30_000) {
  const [, payloadB64] = accessToken.split(".");
  const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
  const expMs = payload.exp * 1000;
  return Date.now() + skewMs >= expMs;
}
