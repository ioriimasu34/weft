import { createHmac } from "crypto";

/**
 * DEV-ONLY HMAC verification placeholder.
 * !!! Replace with Ed25519 verification in production. !!!
 */
export function verifyDevHmac(message: string, key: string, signatureHex: string): boolean {
  if (process.env.NODE_ENV !== "production") {
    // Loud warning in dev to avoid shipping this by mistake.
    console.warn("[WEFT][DEV] Using HMAC verify placeholder — replace with Ed25519 before production.");
  }
  const sig = createHmac("sha256", key).update(message).digest("hex");
  return sig === signatureHex.toLowerCase();
}
