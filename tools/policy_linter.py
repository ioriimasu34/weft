#!/usr/bin/env python3
import argparse, json, sys, re
from fnmatch import fnmatch

def load_json(p):
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def compile_policy(policy):
    base_allowed = set(policy.get("allowed_effects", []))
    base_allowlist = set(policy.get("net", {}).get("allowlist", []))
    overrides = policy.get("overrides", [])
    compiled = []
    for ov in overrides:
        pat = ov.get("module_pattern", ".*")
        try:
            rx = re.compile(pat)
        except re.error as e:
            raise SystemExit(f"Invalid module_pattern '{pat}': {e}")
        ov_allowed = set(ov.get("allowed_effects", []))
        ov_allowlist = set(ov.get("net", {}).get("allowlist", []))
        compiled.append((rx, ov_allowed, ov_allowlist))
    return base_allowed, base_allowlist, compiled

def check_manifest(manifest, base_allowed, base_allowlist, compiled):
    module = manifest.get("module", "")
    effects = set(manifest.get("effects", []))
    endpoints = manifest.get("endpoints", [])

    # Determine effective policy (apply first matching override by regex; if none, use base)
    eff_allowed = set(base_allowed)
    eff_allowlist = set(base_allowlist)
    for rx, ov_allowed, ov_allowlist in compiled:
        if rx.search(module):
            if ov_allowed:
                eff_allowed = ov_allowed
            eff_allowlist |= ov_allowlist
            break

    errors = []
    unknown = effects - set(["Db","Net","Now","Kms","Serial"])
    if unknown:
        errors.append(f"Unknown effects: {sorted(unknown)}")

    # Effect inclusion
    if not effects.issubset(eff_allowed):
        disallowed = effects - eff_allowed
        errors.append(f"Disallowed effects for module '{module}': {sorted(disallowed)} (allowed: {sorted(eff_allowed)})")

    # Net requires endpoints that match allowlist
    if "Net" in effects:
        if not endpoints:
            errors.append("Net effect present but no endpoints[] provided in manifest")
        else:
            bad = [e for e in endpoints if not any(fnmatch(e, pat) for pat in eff_allowlist)]
            if bad:
                errors.append(f"Endpoints not permitted by allowlist: {bad} (allowlist: {sorted(eff_allowlist)})")

    return errors

def main():
    ap = argparse.ArgumentParser(description="Weft policy linter")
    ap.add_argument("--policy", required=True, help="Path to environment policy JSON")
    ap.add_argument("manifests", nargs="+", help="Manifest JSON files to lint")
    args = ap.parse_args()

    policy = load_json(args.policy)
    base_allowed, base_allowlist, compiled = compile_policy(policy)

    had_err = False
    for mf in args.manifests:
        manifest = load_json(mf)
        errs = check_manifest(manifest, base_allowed, base_allowlist, compiled)
        if errs:
            had_err = True
            print(f"[FAIL] {mf}")
            for e in errs: print("  -", e)
        else:
            print(f"[OK]   {mf}")

    sys.exit(1 if had_err else 0)

if __name__ == "__main__":
    main()
