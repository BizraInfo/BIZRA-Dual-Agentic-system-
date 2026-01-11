#!/usr/bin/env bash
set -euo pipefail
source scripts/demo_functions.sh

log_step "THIRD FACT PREFLIGHT"

require_cmd python3
require_cmd sha256sum
require_cmd jq

# Check Rust/Verifier
if [[ ! -x verifier/bizra-verify-receipt ]]; then
    echo -e "${YELLOW}⚠ Verifier wrapper missing. Checking build...${NC}"
    if [[ -x verifier/target/release/bizra-verify-receipt ]]; then
        cp verifier/target/release/bizra-verify-receipt verifier/
    else
        fail_close "Verifier not built. Run 'make build-verifier' or 'cargo build --release' in verifier/"
    fi
fi

verify_or_fail "verifier/bizra-verify-receipt version" "Verifier binary OK"

# Constitution Hash Pinning
local_hash="$(sha256sum constitution/third_fact.yaml | awk '{print $1}')"
if [[ -s constitution/third_fact.hash ]]; then
    expected="$(cat constitution/third_fact.hash | tr -d '\n')"
    verify_or_fail "[[ \"${local_hash}\" == \"${expected}\" ]]" "Constitution Integrity"
else
    echo "${local_hash}" > constitution/third_fact.hash
    echo -e "${YELLOW}⚠ Pinned new constitution hash${NC}"
fi

log_step "✅ PREFLIGHT PASSED"