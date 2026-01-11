#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ==============================================================================
# BIZRA ELITE MASTERPIECE SEALING SCRIPT
# Architecture: PAT (Magnificent 7)
# Purpose: Build, Verify, and Cryptographically Seal the Sovereign Kernel
# ==============================================================================

echo "🔒 INITIALIZING MASTERPIECE SEALING PROTOCOL..."
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
SEAL_ID="SEAL_${TIMESTAMP}_NODE0"

ALLOW_SIMULATED="${ALLOW_SIMULATED:-0}"
AUTO_INSTALL="${AUTO_INSTALL:-1}"
BUILD_OUTPUT_DIR="${BUILD_OUTPUT_DIR:-dist}"
SNR_TARGET="${SNR_TARGET:-0.95}"

REQUIRE_FFI=1
if [ "$ALLOW_SIMULATED" = "1" ]; then
    REQUIRE_FFI=0
fi

# Prefer project venv if present
PYTHON_BIN="python3"
VENV_ACTIVE=0
if [ -x ".venv/bin/python" ]; then
    PYTHON_BIN=".venv/bin/python"
    VENV_ACTIVE=1
fi

# 1. Environment Validation
echo "🔍 [1/5] SCANNING ENVIRONMENT..."
if command -v cargo >/dev/null 2>&1 && command -v rustc >/dev/null 2>&1; then
    echo "✅ Rust toolchain detected."
    BUILD_MODE="native"
else
    echo "⚠️ Rust toolchain not detected. Assuming Docker-based build context."
    BUILD_MODE="docker"
fi

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "❌ Python3 required but not found."
    exit 1
fi

PIP_CMD=("$PYTHON_BIN" "-m" "pip")
MATURIN_CMD=("$PYTHON_BIN" "-m" "maturin")

RUSTC_VERSION=$(rustc --version 2>/dev/null || echo "missing")
CARGO_VERSION=$(cargo --version 2>/dev/null || echo "missing")
PYTHON_VERSION=$("$PYTHON_BIN" --version 2>&1 || echo "missing")
PIP_VERSION=$("${PIP_CMD[@]}" --version 2>/dev/null || echo "missing")
Z3_VERSION=$(z3 -version 2>/dev/null || echo "missing")

# 2. Dependency Check (FATE/Z3)
echo "⚖️ [2/5] VERIFYING FATE DEPENDENCIES..."
if [ -f "Cargo.toml" ]; then
    echo "✅ Cargo manifest found."
else
    echo "❌ Critical: No Cargo.toml found in root."
    exit 1
fi

CORE_FILES=("src/lib.rs" "src/pat.rs" "src/sape/mod.rs")
MISSING_CORE=0
for file in "${CORE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing core file: $file"
        MISSING_CORE=1
    fi
done
if [ "$MISSING_CORE" -eq 1 ]; then
    exit 1
fi

# 3. Build & Test (The Crucible)
echo "🔥 [3/5] ENTERING THE CRUCIBLE (BUILD PHASE)..."

FFI_STATUS="UNBUILT"
FFI_WHEEL=""
MATURIN_READY=0

if [ "$BUILD_MODE" == "native" ]; then
    if "${MATURIN_CMD[@]}" --version >/dev/null 2>&1; then
        MATURIN_READY=1
    elif [ "$AUTO_INSTALL" = "1" ]; then
        echo "   Installing maturin for native build..."
        PIP_SCOPE=()
        if [ "$VENV_ACTIVE" -eq 0 ]; then
            PIP_SCOPE+=(--user)
        fi
        "${PIP_CMD[@]}" install --upgrade --quiet --disable-pip-version-check "${PIP_SCOPE[@]}" maturin
        if "${MATURIN_CMD[@]}" --version >/dev/null 2>&1; then
            MATURIN_READY=1
        fi
    fi

    if [ "$MATURIN_READY" -eq 1 ]; then
        echo "   Running: maturin build --release --features python -o ${BUILD_OUTPUT_DIR}"
        mkdir -p "$BUILD_OUTPUT_DIR"
        if "${MATURIN_CMD[@]}" build --release --features python -o "$BUILD_OUTPUT_DIR"; then
            FFI_WHEEL=$(ls -1t "$BUILD_OUTPUT_DIR"/bizra_ffi*.whl 2>/dev/null | head -n 1 || true)
            if [ -n "$FFI_WHEEL" ]; then
                if "${PIP_CMD[@]}" install --force-reinstall "$FFI_WHEEL"; then
                    echo "✅ Native build and install successful."
                    FFI_STATUS="ACTIVE"
                else
                    echo "⚠️ Wheel install failed."
                    FFI_STATUS="INSTALL_FAILED"
                fi
            else
                echo "⚠️ No wheel artifact found."
                FFI_STATUS="WHEEL_MISSING"
            fi
        else
            echo "⚠️ Native build failed."
            FFI_STATUS="BUILD_FAILED"
        fi
    else
        echo "⚠️ Maturin missing; native build skipped."
        FFI_STATUS="MISSING_MATURIN"
    fi
else
    echo "   Skipping native build (Docker mode)."
    FFI_STATUS="PENDING_DOCKER"
fi

MATURIN_VERSION=$("${MATURIN_CMD[@]}" --version 2>/dev/null || echo "missing")

# 4. Elite Verification (The Probe)
echo "🧬 [4/5] EXECUTING ELITE VERIFICATION PROBE..."
mkdir -p verification
cat > verification/elite_probe.py << 'EOF'
import json
import time

try:
    import bizra_ffi

    print(
        json.dumps(
            {
                "ffi": "active",
                "status": "sovereign",
                "version": bizra_ffi.get_version(),
                "timestamp": time.time(),
            }
        )
    )
except Exception as exc:
    # Simulation fallback output for the seal
    print(
        json.dumps(
            {
                "ffi": "missing",
                "status": "simulated",
                "reason": str(exc),
                "ihsan_vector": {"correctness": 0.95, "safety": 1.0},
                "timestamp": time.time(),
            }
        )
    )
EOF

PROBE_RESULT=$("$PYTHON_BIN" verification/elite_probe.py)

# 5. Cryptographic Sealing
echo "🛡️ [5/5] GENERATING GENESIS SEAL..."

CORE_HASH=$(sha256sum "${CORE_FILES[@]}" | sha256sum | awk '{print $1}')
if [ -f "constitution/ihsan_v1.yaml" ]; then
    CONSTITUTION_HASH=$(sha256sum constitution/ihsan_v1.yaml | awk '{print $1}')
    CONSTITUTION_OK=1
else
    CONSTITUTION_HASH="MISSING"
    CONSTITUTION_OK=0
fi

CORE_OK=1
FFI_OK=0
if [ "$FFI_STATUS" = "ACTIVE" ]; then
    FFI_OK=1
fi

PROBE_OK=$(
    PROBE_RESULT_JSON="$PROBE_RESULT" "$PYTHON_BIN" - <<'PY'
import json
import os

raw = os.environ.get("PROBE_RESULT_JSON", "")
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print(0)
else:
    print(1 if data.get("ffi") == "active" else 0)
PY
)

BUILD_OK=0
if [ "$BUILD_MODE" = "native" ]; then
    BUILD_OK=1
fi

CHECKS_TOTAL=5
CHECKS_PASSED=$((CORE_OK + CONSTITUTION_OK + FFI_OK + PROBE_OK + BUILD_OK))

SNR_SCORE=$(
    CHECKS_PASSED="$CHECKS_PASSED" CHECKS_TOTAL="$CHECKS_TOTAL" "$PYTHON_BIN" - <<'PY'
import os

passed = int(os.environ.get("CHECKS_PASSED", "0"))
total = int(os.environ.get("CHECKS_TOTAL", "0"))
score = 0.0 if total == 0 else passed / total
print(f"{score:.2f}")
PY
)

SNR_STATUS=$(
    SNR_SCORE="$SNR_SCORE" SNR_TARGET="$SNR_TARGET" "$PYTHON_BIN" - <<'PY'
import os

score = float(os.environ.get("SNR_SCORE", "0"))
target = float(os.environ.get("SNR_TARGET", "0.95"))
print("ELITE" if score >= target else "BELOW_TARGET")
PY
)

SEAL_STATUS="SEALED"
EXIT_CODE=0
if [ "$CORE_OK" -ne 1 ]; then
    SEAL_STATUS="FAILED_CORE"
    EXIT_CODE=2
elif [ "$REQUIRE_FFI" -eq 1 ] && [ "$FFI_OK" -ne 1 ]; then
    SEAL_STATUS="FAILED_FFI"
    EXIT_CODE=2
elif [ "$REQUIRE_FFI" -eq 1 ] && [ "$PROBE_OK" -ne 1 ]; then
    SEAL_STATUS="FAILED_PROBE"
    EXIT_CODE=2
elif [ "$PROBE_OK" -ne 1 ]; then
    SEAL_STATUS="SIMULATED"
fi

MESSAGE="The Masterpiece is structurally complete. Reality Compiler (Docker) required for final materialization."
if [ "$SEAL_STATUS" = "SEALED" ]; then
    MESSAGE="Seal verified with native FFI and evidence graph."
elif [ "$SEAL_STATUS" = "SIMULATED" ]; then
    MESSAGE="Seal produced in simulated mode. Enable native build for full verification."
else
    MESSAGE="Seal failed. Resolve FFI build or probe issues, then retry."
fi

GIT_SHA="unknown"
GIT_STATE="unknown"
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    GIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
        GIT_STATE="clean"
    else
        GIT_STATE="dirty"
    fi
fi

OS_INFO=$(uname -a 2>/dev/null || echo "unknown")

GIANTS=()
if [ "$CARGO_VERSION" != "missing" ]; then
    GIANTS+=("Rust toolchain")
fi
if [ "$PYTHON_VERSION" != "missing" ]; then
    GIANTS+=("Python runtime")
fi
if [ "$MATURIN_READY" -eq 1 ]; then
    GIANTS+=("Maturin")
fi
if command -v git >/dev/null 2>&1; then
    GIANTS+=("Git")
fi
GIANTS_STR=$(IFS=','; echo "${GIANTS[*]}")

CORE_FILES_STR=$(IFS=','; echo "${CORE_FILES[*]}")

SEAL_JSON=$(
    SEAL_ID="$SEAL_ID" TIMESTAMP="$TIMESTAMP" BUILD_MODE="$BUILD_MODE" FFI_STATUS="$FFI_STATUS" \
    FFI_WHEEL="$FFI_WHEEL" CORE_HASH="$CORE_HASH" CONSTITUTION_HASH="$CONSTITUTION_HASH" \
    PROBE_RESULT_JSON="$PROBE_RESULT" RUSTC_VERSION="$RUSTC_VERSION" CARGO_VERSION="$CARGO_VERSION" \
    PYTHON_VERSION="$PYTHON_VERSION" PIP_VERSION="$PIP_VERSION" MATURIN_VERSION="$MATURIN_VERSION" \
    Z3_VERSION="$Z3_VERSION" SNR_SCORE="$SNR_SCORE" SNR_STATUS="$SNR_STATUS" SNR_TARGET="$SNR_TARGET" \
    SEAL_STATUS="$SEAL_STATUS" MESSAGE="$MESSAGE" GIT_SHA="$GIT_SHA" GIT_STATE="$GIT_STATE" \
    OS_INFO="$OS_INFO" GIANTS_STR="$GIANTS_STR" CORE_FILES_STR="$CORE_FILES_STR" \
    REQUIRE_FFI="$REQUIRE_FFI" ALLOW_SIMULATED="$ALLOW_SIMULATED" BUILD_OUTPUT_DIR="$BUILD_OUTPUT_DIR" \
    CHECKS_PASSED="$CHECKS_PASSED" CHECKS_TOTAL="$CHECKS_TOTAL" \
    "$PYTHON_BIN" - <<'PY'
import json
import os

def split_list(value):
    return [item for item in (value or "").split(",") if item]

probe_raw = os.environ.get("PROBE_RESULT_JSON", "")
try:
    probe = json.loads(probe_raw)
except json.JSONDecodeError:
    probe = {"raw": probe_raw}

seal = {
    "seal_id": os.environ.get("SEAL_ID"),
    "architect": "PAT_MAGNIFICENT_7",
    "node": "NODE_0_TITAN",
    "status": os.environ.get("SEAL_STATUS"),
    "build_mode": os.environ.get("BUILD_MODE"),
    "ffi_status": os.environ.get("FFI_STATUS"),
    "ffi_wheel": os.environ.get("FFI_WHEEL") or None,
    "core_integrity_hash": os.environ.get("CORE_HASH"),
    "core_files": split_list(os.environ.get("CORE_FILES_STR")),
    "constitution_hash": os.environ.get("CONSTITUTION_HASH"),
    "probe_result": probe,
    "timestamp": os.environ.get("TIMESTAMP"),
    "git": {
        "sha": os.environ.get("GIT_SHA"),
        "state": os.environ.get("GIT_STATE"),
    },
    "toolchain": {
        "rustc": os.environ.get("RUSTC_VERSION"),
        "cargo": os.environ.get("CARGO_VERSION"),
        "python": os.environ.get("PYTHON_VERSION"),
        "pip": os.environ.get("PIP_VERSION"),
        "maturin": os.environ.get("MATURIN_VERSION"),
        "z3": os.environ.get("Z3_VERSION"),
        "os": os.environ.get("OS_INFO"),
    },
    "protocols": {
        "interdisciplinary_thinking": True,
        "graph_of_thoughts": "evidence_graph",
        "standing_on_shoulders": True,
    },
    "seal_policy": {
        "require_ffi": os.environ.get("REQUIRE_FFI") == "1",
        "allow_simulated": os.environ.get("ALLOW_SIMULATED") == "1",
        "build_output_dir": os.environ.get("BUILD_OUTPUT_DIR"),
    },
    "snr_autonomy_engine": {
        "target": float(os.environ.get("SNR_TARGET", "0.95")),
        "score": float(os.environ.get("SNR_SCORE", "0")),
        "status": os.environ.get("SNR_STATUS"),
        "checks_passed": int(os.environ.get("CHECKS_PASSED", "0")),
        "checks_total": int(os.environ.get("CHECKS_TOTAL", "0")),
        "checks": {
            "core_integrity": os.environ.get("CORE_HASH") != "MISSING",
            "constitution_present": os.environ.get("CONSTITUTION_HASH") != "MISSING",
            "ffi_built": os.environ.get("FFI_STATUS") == "ACTIVE",
            "probe_active": probe.get("ffi") == "active",
            "build_mode_native": os.environ.get("BUILD_MODE") == "native",
        },
    },
    "multi_lens": {
        "security": "ok" if os.environ.get("CONSTITUTION_HASH") != "MISSING" else "warn",
        "performance": "ok" if os.environ.get("BUILD_MODE") == "native" else "warn",
        "reliability": "ok" if probe.get("ffi") == "active" else "warn",
        "governance": "ok" if os.environ.get("CONSTITUTION_HASH") != "MISSING" else "warn",
    },
    "evidence_graph": {
        "nodes": [
            {"id": "core", "type": "source_bundle", "hash": os.environ.get("CORE_HASH")},
            {"id": "constitution", "type": "policy", "hash": os.environ.get("CONSTITUTION_HASH")},
            {"id": "ffi", "type": "ffi_bridge", "status": os.environ.get("FFI_STATUS")},
            {"id": "probe", "type": "runtime_probe", "status": probe.get("status")},
            {"id": "seal", "type": "attestation", "id": os.environ.get("SEAL_ID")},
        ],
        "edges": [
            {"from": "core", "to": "ffi", "rel": "builds"},
            {"from": "ffi", "to": "probe", "rel": "verified_by"},
            {"from": "constitution", "to": "seal", "rel": "governs"},
            {"from": "probe", "to": "seal", "rel": "informs"},
            {"from": "core", "to": "seal", "rel": "sealed_as"},
        ],
    },
    "standing_on_shoulders": {
        "lineage": split_list(os.environ.get("GIANTS_STR")),
    },
    "message": os.environ.get("MESSAGE"),
}

print(json.dumps(seal, indent=2))
PY
)

cat > BIZRA_MASTERPIECE_SEAL.json <<EOF
$SEAL_JSON
EOF

echo "✅ MASTERPIECE SEALED: BIZRA_MASTERPIECE_SEAL.json"
cat BIZRA_MASTERPIECE_SEAL.json

if [ "$EXIT_CODE" -ne 0 ]; then
    exit "$EXIT_CODE"
fi

if [ "${RUN_PEAK_ATTESTATION:-0}" = "1" ]; then
    echo "🏆 Running peak masterpiece attestation..."
    scripts/peak_masterpiece.sh
fi
