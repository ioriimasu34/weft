import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ActorSystem, bindCaps } from "./index.js";

// Resolve repo paths from dist/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const manifest = (p: string) => JSON.parse(fs.readFileSync(p, "utf-8"));

// Load manifests
const ingestMf = manifest(path.resolve(repoRoot, "examples/manifests/ingest.manifest.json"));
const kpiMf    = manifest(path.resolve(repoRoot, "examples/manifests/kpi.manifest.json"));

// Build runtime system
const sys = new ActorSystem();
const log = (...a: any[]) => console.log(...a);

// Helper to run a transpiled module with granted caps
async function runModule(genRelPath: string, mf: any, extra?: any) {
  const mod = await import(genRelPath);
  const cap = sys.issueToken(mf.module, mf.effects as any, true);
  const ctx = { caps: bindCaps(cap), now: () => Date.now(), log };
  await mod.run(ctx, { endpoints: mf.endpoints, ...extra });
}

(async () => {
  console.log("=== Running ingest example ===");
  await runModule("./gen/ingest.gen.js", ingestMf);
  console.log("=> OK: textile.ingest\n");

  console.log("=== Running KPI example ===");
  await runModule("./gen/line_kpi.gen.js", kpiMf, { smv_sec: 40 });

  // Simple red-flag demo using computed target
  const smv = 40;
  const target = Math.floor((3600 / smv) * 0.85);
  const produced = [60, 80, 72, 45, 90];
  const redFlags = produced.map((p, i) => (p < target ? `op${i + 1}` : null)).filter(Boolean);
  console.log(`[Weft] KPI summary: target=${target} pcs/hr, red_flags=${JSON.stringify(redFlags)}`);
  console.log("=> OK: textile.kpi");
})();
