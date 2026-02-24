#!/usr/bin/env bash
set -euo pipefail
source scripts/demo_functions.sh
log_step "Minute 2: Impossible Jailbreak (FATE Block)"

tmpdir="$(mktemp -d)"
cat prompts/hostile_prompt.txt > "$tmpdir/raw_prompt.txt"

# MOCK FATE VERDICT
cat > "$tmpdir/output_bizra.txt" <<EOF
ERROR: Constitutional violation detected
FATE Z3 Proof Status: UNSAT
Ihsān would drop to: 0.12 (threshold: 0.95)
Action: Safe Mode activated.
EOF

rid="$(./scripts/emit_receipt.sh --type fate_block --metadata '{"fate":"UNSAT","ihsan_drop":0.12}' --evidence-dir "$tmpdir")"

dest="evidencepacks/${rid}"
mkdir -p "$dest" && cp -a "$tmpdir/." "$dest/" && rm -rf "$tmpdir"
echo -e "${GREEN}✓ Receipt: ${rid}${NC}"