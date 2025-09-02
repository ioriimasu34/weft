# Weft — a security-first hybrid language (stitch-os/weft)

**Targets:** native (LLVM), WASM (WASI), and a fast dev VM.  
**Effects:** Db, Net, Now, Kms, Serial.  
**Crypto (spec-first):** Ed25519 signatures; XChaCha20-Poly1305 AEAD.

## Quickstart

```bash
# 1) Get the repo
git clone https://github.com/stitch-os/weft.git
cd weft

<<<<<<< HEAD
# 2) Build the compiler stub (real CLI arrives in Step 2)
=======
# 2) Build the compiler CLI
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
cd compiler && cargo build && cd ..

# 3) TypeScript runtime (Step 4 will flesh out actor kernel)
cd runtime-ts && npm ci && npm run build && cd ..

# 4) Lint manifests against a policy (sample policies arrive in Step 3)
python3 tools/policy_linter.py --help

<<<<<<< HEAD
# 5) Example manifests live in examples/manifests (wired up in Step 5)
=======
# 5) Run examples end-to-end
make examples
```

## Load testing

```bash
# Terminal 1: start the ingest bench
npx ts-node --compiler-options '{"module":"es2022"}' tools/ingest_bench.ts

# Terminal 2: send 500 events/sec in batches of 125 for 5 seconds
python3 tools/loadgen.py -n 500 -b 125 -d 5 --url http://localhost:8788/ingest
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
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
```

Repository layout
compiler/ — Rust CLI weftc

runtime-ts/ — TypeScript runtime shell (actors & caps)

runtime-vm/ — VM stub (to be replaced/expanded)

<<<<<<< HEAD
tools/ — policy linter, dev packer, loadgen
=======
tools/ — policy linter, dev packer, loadgen, ingest bench
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout

proto/ — protobuf definitions (scans)

site/ — Vue 3 + Vite docs/sandbox shell

server/ — Express API shell

See THREAT_MODEL.md and SECURITY.md for security posture and disclosure process.
