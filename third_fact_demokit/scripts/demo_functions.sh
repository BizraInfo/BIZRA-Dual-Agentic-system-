#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/colors.sh"

fail_close() {
    echo -e "${RED}❌ FAIL-CLOSE: $1${NC}" >&2
    exit 99
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || fail_close "Missing dependency: $1"
}

log_step() {
    echo ""
    echo "================================================"
    echo -e "${BLUE}🔹 $(date -u +%Y-%m-%dT%H:%M:%SZ) | $1${NC}"
    echo "================================================"
}

verify_or_fail() {
    echo -n "  $2: "
    if eval "$1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        fail_close "Verification failed: $2"
    fi
}

last_receipt_id() {
    if [[ -f "receipts/chain_last.txt" ]]; then cat receipts/chain_last.txt; else echo ""; fi
}

update_chain() {
    local rid="$1"
    if [[ ! -f "receipts/chain_first.txt" ]]; then echo "$rid" > receipts/chain_first.txt; fi
    echo "$rid" > receipts/chain_last.txt
}