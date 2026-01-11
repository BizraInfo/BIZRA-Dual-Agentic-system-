#!/usr/bin/env python3
"""
BIZRA OMEGA: FINAL SNR SCORING & APOTHEOSIS VERIFIER
"The Final Seal of the Masterpiece"

This script performs the ultimate interdisciplinary audit across all 7 Planes.
"""

import os
import sys
import subprocess
import yaml
import time
import json
from pathlib import Path

# ANSI colors for elite output
C = "\033[96m"
G = "\033[92m"
Y = "\033[93m"
R = "\033[91m"
B = "\033[1m"
E = "\033[0m"

ROOT = Path("/root/bizra-genesis")

def print_header(text):
    print(f"\n{B}{C}=== {text} ==={E}")

def run_step(name, command, cwd=ROOT):
    print(f"🔹 {name}...", end="", flush=True)
    try:
        t0 = time.time()
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        dt = time.time() - t0
        if result.returncode == 0:
            print(f" {G}PASSED{E} ({dt:.2f}s)")
            return True, result.stdout
        else:
            print(f" {R}FAILED{E}")
            print(f"{R}{result.stderr}{E}")
            return False, result.stderr
    except Exception as e:
        print(f" {R}ERROR: {e}{E}")
        return False, str(e)

def calculate_snr():
    scores = []
    
    print_header("PLANE 1: CONSTITUTIONAL INTEGRITY")
    const_path = ROOT / "constitution" / "ihsan_v1.yaml"
    with open(const_path, "r") as f:
        cfg = yaml.safe_load(f)
        adl_weight = cfg["dimensions"]["adl_fairness"]["weight"]
        if adl_weight >= 0.10:
            print(f"✅ Adl fairness weight is balanced: {adl_weight}")
            scores.append(1.0)
        else:
            print(f"⚠️ Adl fairness weight is low: {adl_weight}")
            scores.append(adl_weight / 0.10)

    print_header("PLANE 7/6: KERNEL & BRIDGE PERFORMANCE")
    # Check if Iceoryx2 is integrated
    bridge_path = ROOT / "bizra-genesis-node/backend/src/sovereign_bridge.rs"
    with open(bridge_path, "r") as f:
        content = f.read()
        if "iceoryx2" in content.lower() and "CognitiveFrame" in content:
            print(f"✅ Zero-Copy High-Fidelity Bridge Detected.")
            scores.append(1.0)
        else:
            print(f"❌ Legacy Bridge detected. Latency risk high.")
            scores.append(0.5)

    print_header("PLANE 2/3: LINGUISTIC & SAPE VALIDATION")
    success, _ = run_step("Z3 Invariant Check", "z3 baleeq-arabic/specs/arabic_ground_truth.smt2")
    scores.append(1.0 if success else 0.0)
    
    success, _ = run_step("Rust Kernel Compilation", "cd bizra-genesis-node/backend && cargo check")
    scores.append(1.0 if success else 0.0)

    print_header("PLANE 4/5: COGNITIVE GO-T & SOSG")
    success, _ = run_step("Graph of Thoughts Reasoning", f"python3 {ROOT}/cognitive-plane/protocols/graph_of_thoughts.py")
    if success:
        print(f"✅ SOSG Protocol (Standing on Giants) Activated.")
        scores.append(1.0)
    else:
        scores.append(0.0)

    final_snr = sum(scores) / len(scores)
    
    print_header("FINAL APOTHEOSIS REPORT")
    print(f"SYSTEM STATE: {B}{'SYNCHRONIZED' if final_snr > 0.95 else 'DEGRADED'}{E}")
    print(f"FINAL SNR SCORE: {B}{final_snr:.4f}{E}")
    
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "snr_score": final_snr,
        "gates": {
            "constitutional": scores[0],
            "bridge": scores[1],
            "linguistic": scores[2],
            "kernel": scores[3]
        }
    }
    
    with open(ROOT / "final_snr_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    if final_snr >= 0.99:
        print(f"\n{G}🏆 MASTERPIECE ACHIEVED: CONVERGENCE AT PEAK PERFORMANCE.{E}")
        return 0
    else:
        print(f"\n{Y}⚡ SYSTEM OPTIMIZED BUT REQUIRES FINAL TWINNING.{E}")
        return 1

if __name__ == "__main__":
    sys.exit(calculate_snr())
