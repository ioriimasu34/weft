# Threat Model (initial)

## Surfaces
- Supply chain: malicious deps, tampered artifacts.
- Effects abuse: unbounded `Net`, `Db` writes, time/Now abuse.
- Secret leakage: keys in logs, manifests, or packages.

## Mitigations
- Capabilities model: explicit `effects` in manifests; policy linter to enforce env rules.
- Signed packages (spec): Ed25519 signatures; encrypted payloads (XChaCha20-Poly1305).
- Data safety: sample datasets use RLS (Row-Level Security) and tenant scoping.

See `tools/policy_linter.py` and `docs/effects.md`.
