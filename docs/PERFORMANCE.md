<<<<<<< HEAD
<<<<<<< HEAD
# Performance

Guidelines and notes on performance considerations.
=======
# Performance Notes (preview)
Targets: low-latency actor dispatch; batching for I/O. Detailed SLOs in Step 8.
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
# Performance

## SLOs
- p50 end-to-end actor task < **100 ms**
- p95 < **200 ms**
- p99 < **300 ms**
- Warm start for actors < **50 ms**; cold start < **200 ms** (VM)
- Max mailbox backlog per actor: **1024** messages (drop/alert beyond)

## Batching strategy
- Default batch size: **128–256** events (tune per endpoint/IO latency)
- Flush on:
  - batch full OR
  - **50 ms** timer (low-latency bias) OR
  - backpressure signal (Net/Db)
- Prefer **NDJSON** over one-big-JSON to avoid tail amplification and allow streaming.
- For Net: set max in-flight batches to **4** per actor (adaptive backoff on 429/5xx).

## Postgres/Timescale partitioning notes
- **Hypertable** (Timescale) or **range partitions** by `ts` (daily) + **subpartitions** by `tenant_id`.
- Use **sparse** covering indexes:
  - `(tenant_id, ts DESC)` for recent scans
  - `btree (tag_id)` + `BRIN (ts)` for cold scans
- Maintenance:
  - **Retention**: drop partitions > 90 days (configurable)
  - **VACUUM (AUTO)** with `autovacuum_vacuum_scale_factor` tuned (0.05–0.1)
  - **Fillfactor** 90 on hot insert tables
- Writer tips:
  - Use **COPY** / multi-row INSERTs for >1k rows
  - Keep **connection pool** < core count; use **prepared statements**

## Tools
- `tools/loadgen.py` — generate N events/sec with batching; use `--url` to POST to an ingest endpoint.
- `tools/ingest_bench.ts` — HTTP receiver that prints throughput metrics.

Example full-loop run:

```bash
# Terminal 1: start bench
npx ts-node --compiler-options '{"module":"es2022"}' tools/ingest_bench.ts

# Terminal 2: send 500 events/sec in batches of 125 for 5 seconds
python3 tools/loadgen.py -n 500 -b 125 -d 5 --url http://localhost:8788/ingest
```

>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
