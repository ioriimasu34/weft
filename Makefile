# Minimal for Step 5; full Makefile comes in Step 10
.PHONY: examples

examples:
	@echo "==> Build compiler"
	cd compiler && cargo build

	@echo "==> Transpile examples to TS into runtime-ts/src/gen"
	mkdir -p runtime-ts/src/gen
	./compiler/target/debug/weftc transpile-ts examples/ingest.weft --out runtime-ts/src/gen/ingest.gen.ts
	./compiler/target/debug/weftc transpile-ts examples/line_kpi.weft --out runtime-ts/src/gen/line_kpi.gen.ts

	@echo "==> Build TS runtime (includes generated files)"
	cd runtime-ts && npm install && npm run build

	@echo "==> Run examples"
	node runtime-ts/dist/run_examples.js
