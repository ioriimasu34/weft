#!/usr/bin/env node
/**
 * Weft ingest bench: accepts JSON batches via HTTP and prints throughput.
 *
 * - POST /ingest  body: { events: Array<any> }
 * - Flags: PORT (env) default 8788, LOG_INTERVAL_MS=1000
 *
 * Run: npx ts-node tools/ingest_bench.ts
 * Send: curl -s -XPOST http://localhost:8788/ingest -H 'content-type: application/json' \
 *         -d '{"events":[{"id":1},{"id":2}]}' >/dev/null
 */
import http from "node:http";

const PORT = Number(process.env.PORT ?? 8788);
const LOG_INTERVAL_MS = Number(process.env.LOG_INTERVAL_MS ?? 1000);

let total = 0;
let secWin = 0;

const srv = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/ingest") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const j = JSON.parse(body || "{}");
        const n = Array.isArray(j.events) ? j.events.length : 0;
        total += n; secWin += n;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, received: n }));
      } catch (e) {
        res.statusCode = 400; res.end(JSON.stringify({ ok: false, error: "bad json" }));
      }
    });
    return;
  }
  res.statusCode = 404; res.end();
});

srv.listen(PORT, () => {
  console.log(JSON.stringify({ status: "listening", port: PORT }));
});

setInterval(() => {
  const eps = secWin / (LOG_INTERVAL_MS / 1000);
  console.log(JSON.stringify({ t: Date.now(), eps: Math.round(eps), total }));
  secWin = 0;
}, LOG_INTERVAL_MS);

