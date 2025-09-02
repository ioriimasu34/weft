#!/usr/bin/env python3
<<<<<<< HEAD
<<<<<<< HEAD

def main():
    print("load generator stub")
=======
import argparse, time, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-n","--events-per-sec", type=int, default=100)
    ap.add_argument("-b","--batch-size", type=int, default=128)
    ap.add_argument("-d","--duration-sec", type=int, default=5)
    args = ap.parse_args()

    total = 0
    start = time.time()
    for _ in range(args.duration_sec):
        batches = args.events_per_sec // args.batch_size
        for _ in range(batches):
            total += args.batch_size
        time.sleep(1)
    elapsed = time.time() - start
    print(f"generated {total} events in {elapsed:.2f}s (~{total/elapsed:.1f} eps)")
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout

if __name__ == "__main__":
    main()
=======
"""Weft load generator

Generates batches of synthetic events at a target rate. By default the
script prints per-second metrics as JSON lines. Use ``--ndjson`` to emit
each event as NDJSON instead. With ``--url`` set, batches are POSTed to
an ingest endpoint (e.g. tools/ingest_bench.ts) while metrics continue
to stream to stdout.
"""

from __future__ import annotations

import argparse
import json
import time
import random
import string
import sys
from typing import List
from urllib import request


def rand_id(n: int = 8) -> str:
    return "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(n))


def make_event(seq: int, tenant: str) -> dict:
    ts = int(time.time() * 1000)
    return {"tenant_id": tenant, "tag_id": f"T{seq:08d}", "ts_ms": ts, "source": "serial"}


def post_batch(url: str, events: List[dict]) -> None:
    data = json.dumps({"events": events}).encode()
    req = request.Request(url, data=data, headers={"content-type": "application/json"})
    with request.urlopen(req) as resp:  # noqa: S310 - simple bench client
        resp.read()  # drain to reuse connection in future expansions


def main() -> None:
    ap = argparse.ArgumentParser(description="Weft load generator (stdout metrics)")
    ap.add_argument("-n", "--events-per-sec", type=int, default=100, help="target events/sec")
    ap.add_argument("-b", "--batch-size", type=int, default=128, help="events per batch")
    ap.add_argument("-d", "--duration-sec", type=int, default=10, help="run time in seconds")
    ap.add_argument("--ndjson", action="store_true", help="emit NDJSON events to stdout")
    ap.add_argument("--tenant", default="t_" + rand_id(6))
    ap.add_argument("--url", help="POST batches to this ingest endpoint")
    args = ap.parse_args()

    target_eps = max(1, args.events_per_sec)
    bs = max(1, args.batch_size)
    duration = max(1, args.duration_sec)

    seq = 0
    start = time.time()

    for sec in range(duration):
        sec_start = time.time()
        sent = 0
        batches = 0
        while sent < target_eps:
            n = min(bs, target_eps - sent)
            events: List[dict] = []
            if args.ndjson or args.url:
                for _ in range(n):
                    seq += 1
                    ev = make_event(seq, args.tenant)
                    if args.ndjson:
                        print(json.dumps(ev))
                    events.append(ev)
            else:
                seq += n

            if args.url:
                try:
                    post_batch(args.url, events)
                except Exception as e:  # pragma: no cover - best-effort logging
                    print(json.dumps({"error": str(e)}), flush=True)

            sent += n
            batches += 1

        if not args.ndjson:
            elapsed = time.time() - sec_start
            eps = sent / elapsed if elapsed > 0 else sent
            print(json.dumps({"sec": sec + 1, "events": sent, "batches": batches, "eps": round(eps, 1)}))

        remaining = 1.0 - (time.time() - sec_start)
        if remaining > 0:
            time.sleep(remaining)

    elapsed = time.time() - start
    if not args.ndjson:
        print(json.dumps({"summary": {"total": target_eps * duration, "seconds": round(elapsed, 2)}}), file=sys.stderr)


if __name__ == "__main__":
    main()

>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
