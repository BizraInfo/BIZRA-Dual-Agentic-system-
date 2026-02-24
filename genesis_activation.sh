#!/usr/bin/env bash
# BIZRA Genesis Activation (Fail-Closed)
#
# This script is designed to prevent "paper audits".
# It generates a MACHINE-DERIVED Guardian report from the current git checkout.
#
# Outputs (in repo):
#   audit/mumu_guardian_report.json
#   audit/genesis.seal           (only if BIZRA_ALLOW_GENESIS=YES and all checks PASS)
#
# Run:
#   chmod +x genesis_activation.sh
#   ./genesis_activation.sh
#   BIZRA_ALLOW_GENESIS=YES ./genesis_activation.sh

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  echo "[FAIL] Not inside a git repo. Run from the BIZRA repo root." >&2
  exit 1
fi
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[FAIL] python3 is required." >&2
  exit 1
fi

mkdir -p audit

python3 - <<'PY'
import json, os, re, subprocess, hashlib, time

def sh(cmd: list[str]) -> str:
    return subprocess.check_output(cmd, text=True).strip()

def git_ls_files() -> list[str]:
    # Try git ls-files first
    if os.path.exists('.git'):
        try:
            out = sh(["git", "ls-files"])
            return [p for p in out.splitlines() if p]
        except:
            pass
    
    # Fallback to filesystem walk
    files = []
    for root, dirs, filenames in os.walk('.'):
        for d in ['.git', 'target', 'audit', 'node_modules', '.vscode', 'backup_evolution']:
            if d in dirs:
                dirs.remove(d)
        for f in filenames:
            files.append(os.path.join(root, f).lstrip('./'))
    return files

def read_text(path: str) -> str:
    try:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except:
        return ""

def file_exists(path: str) -> bool:
    return os.path.isfile(path)

def find_candidates(files: list[str], patterns: list[str]) -> list[str]:
    rx = re.compile("|".join(patterns))
    return [p for p in files if rx.search(p)]

def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def sha256_file(path: str) -> str:
    try:
        return sha256_bytes(open(path, 'rb').read())
    except:
        return "error"

def check_pyo3_panic_airlock(files: list[str]):
    """Fail if any #[pyfunction] does not appear to be guarded."""
    rs_files = [p for p in files if p.endswith('.rs')]
    hits = []
    unguarded = []

    for p in rs_files:
        txt = read_text(p)
        if '#[pyfunction]' not in txt and '#[pyo3' not in txt:
            continue
        lines = txt.splitlines()
        for i, line in enumerate(lines):
            if '#[pyfunction]' in line or ('#[pyo3' in line and 'name =' in line):
                window = "\n".join(lines[i:i+120])
                hits.append({"file": p, "line": i+1})
                # Heuristic guard: catch_unwind OR a dedicated wrapper macro/function OR AssertUnwindSafe.
                # Adding 'AssertUnwindSafe' as explicit signal of handling
                if ('catch_unwind' not in window) and ('ffi_guard' not in window) and ('panic_airlock' not in window) and ('AssertUnwindSafe' not in window):
                    unguarded.append({"file": p, "line": i+1, "evidence": window.splitlines()[:25]})

    if not hits:
        return {"status": "UNKNOWN", "confidence": 0.5,
                "note": "No #[pyfunction] found in tracked files; either FFI not present or paths differ."}

    if unguarded:
        return {"status": "FAIL", "confidence": 0.95,
                "note": "Found #[pyfunction] sites without obvious panic guards.",
                "evidence": unguarded[:5], "count": len(unguarded)}

    return {"status": "PASS", "confidence": 0.9,
            "note": "All #[pyfunction] sites show panic-guard patterns (heuristic).",
            "count": len(hits)}

def check_no_unwrap_expect_in_critical(files: list[str], critical_globs: list[str]):
    cand = [p for p in files if any(p.endswith(g) or p.endswith('/'+g) for g in critical_globs)]
    if not cand:
        return {"status": "UNKNOWN", "confidence": 0.5,
                "note": f"No critical files found among: {critical_globs}."}
    offenders = []
    for p in cand:
        txt = read_text(p)
        # We fail-closed: any unwrap/expect in these critical modules is flagged.
        for pat in ['.unwrap(', '.expect(']:
            if pat in txt:
                # filter commentary?
                lines = txt.splitlines()
                match = False
                for l in lines:
                    if pat in l and not l.strip().startswith('//'):
                        match = True
                        break
                if match:
                    offenders.append({"file": p, "pattern": pat})
    if offenders:
        return {"status": "FAIL", "confidence": 0.95,
                "note": "unwrap/expect found in critical modules (FFI-adjacent / platform / tpm / wasm).",
                "evidence": offenders}
    return {"status": "PASS", "confidence": 0.9,
            "note": "No unwrap/expect found in critical modules.",
            "files_checked": cand}

def check_force_state_gated(files: list[str]):
    target = [p for p in files if 'circuit_breaker' in p]
    if not target:
        return {"status": "UNKNOWN", "confidence": 0.5,
                "note": "circuit_breaker module not found in tracked files."}

    offenders = []
    for p in target:
        txt = read_text(p)
        if 'force_state' not in txt:
            continue
        lines = txt.splitlines()
        for i, line in enumerate(lines):
            if re.search(r"\bforce_state\b", line) and ('fn ' in line or 'def ' in line):
                prefix = "\n".join(lines[max(0, i-12):i+1])
                if ('cfg(' not in prefix) and ('feature' not in prefix) and ('test' not in prefix.lower()):
                    offenders.append({"file": p, "line": i+1, "evidence": prefix.splitlines()[-12:]})

    if offenders:
        return {"status": "FAIL", "confidence": 0.95,
                "note": "force_state appears ungated (not behind cfg(test)/feature).",
                "evidence": offenders[:5], "count": len(offenders)}

    return {"status": "PASS", "confidence": 0.9,
            "note": "force_state is absent or appears gated (heuristic).", "files": target}

def check_receipt_hashing(files: list[str]):
    py_targets = [p for p in files if p.endswith('session_manager.py') or p.endswith('receipts.py')]
    if not py_targets:
        return {"status": "UNKNOWN", "confidence": 0.5,
                "note": "No python session/receipt modules found in tracked files."}

    offenders = []
    for p in py_targets:
        txt = read_text(p)
        # Collision-risk patterns
        if re.search(r"hexdigest\(\)\s*\[:\s*\d+\s*\]", txt):
            offenders.append({"file": p, "pattern": "hexdigest()[:N] truncation"})
        if re.search(r"hashlib\.(md5|sha1)\(", txt):
            offenders.append({"file": p, "pattern": "weak hash (md5/sha1)"})
        # suspicious: hashing only types
        if re.search(r"\b(event\.|event\[\"type\"\])", txt) and ('to_poi_receipt' in txt):
            # This is heuristic; we keep it as a WARN unless we see truncation.
            pass

    if offenders:
        return {"status": "FAIL", "confidence": 0.9,
                "note": "Receipt hashing shows collision-risk patterns.",
                "evidence": offenders}

    return {"status": "PASS", "confidence": 0.8,
            "note": "No obvious truncation/weak-hash patterns found in python receipt code.",
            "files": py_targets}

def check_ihsan_single_source(files: list[str]):
    # Goal: avoid duplicated weights between Rust core and FFI.
    rs_targets = [p for p in files if p.endswith('ihsan.rs') or p.endswith('py.rs')]
    if not rs_targets:
        return {"status": "UNKNOWN", "confidence": 0.5,
                "note": "No ihsan.rs/py.rs found in tracked files."}

    py_files = [p for p in files if p.endswith('py.rs')]
    ihsan_files = [p for p in files if p.endswith('ihsan.rs')]

    has_core_consts = False
    for p in ihsan_files:
        if 'WEIGHT_' in read_text(p):
            has_core_consts = True
            break

    py_has_hardcoded = []
    for p in py_files:
        t = read_text(p)
        # Hard-coded weights heuristic: literal 0.4/0.3 triplet in proximity.
        if re.search(r"0\.4\s*[,;)]\s*0\.3\s*[,;)]\s*0\.3", t.replace('\n',' ')):
            py_has_hardcoded.append(p)

    if py_has_hardcoded:
        return {"status": "FAIL", "confidence": 0.85,
                "note": "FFI layer appears to hard-code Ihsan weights; risk of drift.",
                "evidence": py_has_hardcoded}

    if has_core_consts and py_files:
        return {"status": "PASS", "confidence": 0.75,
                "note": "No obvious duplicated hard-coded weight triplet found in py.rs.",
                "files": {"ihsan_rs": ihsan_files[:3], "py_rs": py_files[:3]}}

    return {"status": "UNKNOWN", "confidence": 0.5,
            "note": "Insufficient signals to confirm single-source Ihsan computation."}

def main():
    utc_now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    try:
        commit = sh(["git", "rev-parse", "HEAD"])
    except:
        commit = "detached-head-no-git"

    files = git_ls_files()

    # Run guardrails
    results = {}
    results['ffi_panic_airlock'] = check_pyo3_panic_airlock(files)
    results['critical_no_unwrap_expect'] = check_no_unwrap_expect_in_critical(
        files,
        critical_globs=['py.rs', 'tpm.rs', 'wasm.rs']
    )
    results['force_state_gating'] = check_force_state_gated(files)
    results['receipt_hashing'] = check_receipt_hashing(files)
    results['ihsan_single_source'] = check_ihsan_single_source(files)

    # Verdict
    hard_fails = [k for k, v in results.items() if v.get('status') == 'FAIL']
    unknowns = [k for k, v in results.items() if v.get('status') == 'UNKNOWN']
    
    # Treat UNKNOWN as FAIL for fail-closed genesis
    verdict = 'GENESIS_INTEGRITY_CONFIRMED' if (not hard_fails and not unknowns) else 'GENESIS_BLOCKED'

    report = {
        "guardian_certificate": {
            "issuer": "BIZRA Guardian (machine-generated)",
            "certificate_id": f"GUARDIAN-CERT-{commit[:12]}",
            "target_system": "BIZRA repo checkout",
            "audit_date": utc_now,
            "commit_hash": commit,
            "findings": results,
            "hard_failures": hard_fails,
            "unknowns": unknowns,
            "verdict": verdict,
        }
    }

    # Write report
    out_path = os.path.join('audit', 'mumu_guardian_report.json')
    try:
        os.makedirs('audit', exist_ok=True)
    except:
        pass
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, sort_keys=True)

    report_hash = sha256_file(out_path)

    # Optional seal
    if os.environ.get('BIZRA_ALLOW_GENESIS') == 'YES':
        if verdict != 'GENESIS_INTEGRITY_CONFIRMED':
             # Print details before exiting
            print(f'[FAIL] BIZRA_ALLOW_GENESIS=YES but guardrails failed. Seal refused.\nVerdict: {verdict}')
            if hard_fails:
                print(f'[FAIL] Hard Failures: {hard_fails}')
            if unknowns:
                print(f'[FAIL] Unknowns (treated as fail): {unknowns}')
            sys.exit(1)
        
        seal = {
            "commit": commit,
            "audit_report_sha256": report_hash,
            "sealed_at": utc_now,
        }
        with open(os.path.join('audit', 'genesis.seal'), 'w', encoding='utf-8') as f:
            json.dump(seal, f, indent=2, sort_keys=True)

    print('[OK] Guardian report written:', out_path)
    print('[OK] guardian_report_sha256:', report_hash)
    print('[OK] verdict:', verdict)
    if hard_fails:
        print('[WARN] hard_failures:', ', '.join(hard_fails))
    if unknowns:
        print('[WARN] unknowns:', ', '.join(unknowns))

import sys
if __name__ == '__main__':
    main()
PY

# Keep output deterministic for logs
if [[ -f audit/mumu_guardian_report.json ]]; then
  echo "[OK] audit/mumu_guardian_report.json exists"
else
  echo "[FAIL] audit report missing" >&2
  exit 1
fi

if [[ "${BIZRA_ALLOW_GENESIS:-NO}" == "YES" ]]; then
  if [[ -f audit/genesis.seal ]]; then
      echo "[OK] genesis.seal written (BIZRA_ALLOW_GENESIS=YES)"
  else
      echo "[FAIL] Genesis seal NOT written despite BIZRA_ALLOW_GENESIS=YES (Audit Failed)"
      exit 1
  fi
else
  echo "[INFO] Seal not written. To seal genesis, re-run with BIZRA_ALLOW_GENESIS=YES"
fi
