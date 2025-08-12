# Weft — a security-first hybrid language (stitch-os/weft)

**Targets:** native (LLVM), WASM (WASI), and a fast dev VM.  
**Effects:** Db, Net, Now, Kms, Serial.  
**Crypto (spec-first):** Ed25519 signatures; XChaCha20-Poly1305 AEAD.

## Quickstart

```bash
# 1) Get the repo
git clone https://github.com/stitch-os/weft.git
cd weft

# 2) Build the compiler CLI
cd compiler && cargo build && cd ..

# 3) TypeScript runtime (Step 4 will flesh out actor kernel)
cd runtime-ts && npm ci && npm run build && cd ..

# 4) Lint manifests against a policy (sample policies arrive in Step 3)
python3 tools/policy_linter.py --help

# 5) Run examples end-to-end
make examples
```

## CLI (Step 2)

```bash
cd compiler
cargo build

# Check: lex/parse/typecheck + effects graph
./target/debug/weftc check ../examples/ingest.weft

# Transpile to TS
./target/debug/weftc transpile-ts ../examples/ingest.weft --out /tmp/ingest.ts

# Stub build
./target/debug/weftc build --target vm --out ../build
```

Repository layout
compiler/ — Rust CLI weftc

runtime-ts/ — TypeScript runtime shell (actors & caps)

runtime-vm/ — VM stub (to be replaced/expanded)

tools/ — policy linter, dev packer, loadgen

proto/ — protobuf definitions (scans)

site/ — Vue 3 + Vite docs/sandbox shell

server/ — Express API shell

See THREAT_MODEL.md and SECURITY.md for security posture and disclosure process.
