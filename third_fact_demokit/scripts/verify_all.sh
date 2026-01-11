#!/usr/bin/env bash
set -euo pipefail
source scripts/demo_functions.sh
log_step "FULL VERIFICATION AUDIT"

for f in receipts/*.json; do
    [ -e "$f" ] || continue
    echo -n "  $(basename "$f"): "
    if verifier/bizra-verify-receipt verify --file "$f" --pubkey keys/demo_public_key.pem >/dev/null; then
        echo -e "${GREEN}✓ SIGNATURE VALID${NC}"
    else
        fail_close "Invalid receipt: $f"
    fi
done

log_step "✅ AUDIT PASSED"