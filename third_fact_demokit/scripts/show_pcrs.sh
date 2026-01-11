#!/usr/bin/env bash
set -euo pipefail
source scripts/demo_functions.sh
log_step "Minute 1: Constitutional Lock (PCR 12-16)"

tmpdir="$(mktemp -d)"
echo "PCR 12: 76dffa0c83693721fb801a9fdab565abd25ece8e613aeea8fb0e0c2dc36121a1" > "$tmpdir/raw_pcrs.txt"
echo "PCR 16: 0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a291827364555463728190a2b3c" >> "$tmpdir/raw_pcrs.txt"

rid="$(./scripts/emit_receipt.sh --type pcr_attestation --metadata '{"pcr_set":"12-16"}' --evidence-dir "$tmpdir")"

dest="evidencepacks/${rid}"
mkdir -p "$dest" && cp -a "$tmpdir/." "$dest/" && rm -rf "$tmpdir"
echo -e "${GREEN}✓ Receipt: ${rid}${NC}"