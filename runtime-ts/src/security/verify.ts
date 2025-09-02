<<<<<<< HEAD
export function verify(): boolean {
  return true;
=======
import { createHmac } from "crypto";

/**
 * DEV-ONLY HMAC verification placeholder.
 * !!! Replace with Ed25519 verification in production. !!!
 */
export function verifyDevHmac(message: string, key: string, signatureHex: string): boolean {
  const sig = createHmac("sha256", key).update(message).digest("hex");
  return sig === signatureHex.toLowerCase();
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
}
