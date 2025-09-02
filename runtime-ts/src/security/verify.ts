<<<<<<< HEAD
<<<<<<< HEAD
export function verify(): boolean {
  return true;
=======
=======
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
import { createHmac } from "crypto";

/**
 * DEV-ONLY HMAC verification placeholder.
 * !!! Replace with Ed25519 verification in production. !!!
 */
export function verifyDevHmac(message: string, key: string, signatureHex: string): boolean {
<<<<<<< HEAD
  const sig = createHmac("sha256", key).update(message).digest("hex");
  return sig === signatureHex.toLowerCase();
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
  if (process.env.NODE_ENV !== "production") {
    // Loud warning in dev to avoid shipping this by mistake.
    console.warn("[WEFT][DEV] Using HMAC verify placeholder — replace with Ed25519 before production.");
  }
  const sig = createHmac("sha256", key).update(message).digest("hex");
  return sig === signatureHex.toLowerCase();
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
}
