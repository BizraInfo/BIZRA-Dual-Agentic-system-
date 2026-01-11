#!/usr/bin/env bash
set -euo pipefail
source scripts/demo_functions.sh

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then DRY_RUN=1; fi

log_step "THIRD FACT LIVE CEREMONY"

./scripts/preflight.sh

# 1. PCRs
./scripts/show_pcrs.sh

# 2. Hostile Prompt (Red Team)
./scripts/run_hostile_prompt.sh

# 3. Simulate Treasury/Economics
# (Stubbed logic for demo continuity)
tmpdir="$(mktemp -d)"
echo "Gini: 0.31" > "$tmpdir/treasury.txt"
rid="$(./scripts/emit_receipt.sh --type treasury_summary --metadata '{"period":"24h"}' --evidence-dir "$tmpdir")"
dest="evidencepacks/${rid}"
mkdir -p "$dest" && cp -a "$tmpdir/." "$dest/" && rm -rf "$tmpdir"
echo -e "${GREEN}✓ Treasury Receipt: ${rid}${NC}"

log_step "✅ CEREMONY COMPLETE"
echo "Run ./scripts/verify_all.sh to audit."