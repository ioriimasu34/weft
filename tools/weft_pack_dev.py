#!/usr/bin/env python3
<<<<<<< HEAD

def main():
    print("weft pack dev stub")
=======
import argparse, json, hmac, hashlib, sys, time, base64

WARN = "DEV PACKER: Uses HMAC instead of Ed25519. DO NOT USE IN PRODUCTION."

def main():
    ap = argparse.ArgumentParser(description="weft dev packer (HMAC signing) — NOT FOR PROD")
    ap.add_argument("--key", required=True, help="HMAC key (dev only)")
    ap.add_argument("--manifest", required=True, help="manifest.json")
    ap.add_argument("--payload", required=True, help="payload file (e.g., transpiled JS/TS)")
    ap.add_argument("--sbom", required=False, help="optional sbom.json")
    ap.add_argument("--out", required=True, help="output .weftpkg")
    args = ap.parse_args()

    with open(args.manifest, "r", encoding="utf-8") as f: manifest = json.load(f)
    with open(args.payload, "rb") as f: payload = f.read()
    sbom = None
    if args.sbom:
        with open(args.sbom, "r", encoding="utf-8") as f: sbom = json.load(f)

    container = {
        "version": 1,
        "created_at": int(time.time()),
        "dev_warning": WARN,
        "manifest": manifest,
        "payload_b64": base64.b64encode(payload).decode(),
        "sbom": sbom,
    }
    data = json.dumps(container, sort_keys=True).encode()
    sig = hmac.new(args.key.encode(), data, hashlib.sha256).hexdigest()
    out = { "container": container, "signature_hmac_sha256": sig }

    with open(args.out, "w", encoding="utf-8") as f: json.dump(out, f, indent=2)
    print(WARN)
    print(f"wrote {args.out}")
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout

if __name__ == "__main__":
    main()
