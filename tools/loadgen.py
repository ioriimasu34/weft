#!/usr/bin/env python3
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

if __name__ == "__main__":
    main()
