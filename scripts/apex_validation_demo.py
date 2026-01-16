#!/usr/bin/env python3
"""
APEX Validation Demo - Quick Demonstration
Shows the validation system in action with immediate output
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

def print_banner():
    print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                    APEX VALIDATION DEMONSTRATION                          ║
║                    Quick System Validation                                ║
╚═══════════════════════════════════════════════════════════════════════════╝

THE LAW: "We don't assume. If we must, we do it with Ihsān."
""", flush=True)

def check_git_state():
    print("\n[1/6] 🔍 Checking Git State...", flush=True)
    try:
        commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()[:8]
        branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], text=True).strip()
        print(f"   ✅ Branch: {branch}", flush=True)
        print(f"   ✅ Commit: {commit}", flush=True)
        return True, {"commit": commit, "branch": branch}
    except Exception as e:
        print(f"   ❌ Failed: {e}", flush=True)
        return False, {}

def check_documentation():
    print("\n[2/6] 📚 Checking Documentation...", flush=True)
    docs = [
        "CLAUDE.md",
        "START_HERE.md",
        "README.md",
        "APEX_VALIDATION_GUIDE.md",
        "PEAK_MASTERPIECE_SYNTHESIS_v10.md"
    ]

    found = 0
    for doc in docs:
        if Path(doc).exists():
            print(f"   ✅ {doc}", flush=True)
            found += 1
        else:
            print(f"   ❌ {doc} (missing)", flush=True)

    return found == len(docs), {"found": found, "total": len(docs)}

def check_scripts():
    print("\n[3/6] 📜 Checking Validation Scripts...", flush=True)
    scripts = [
        "scripts/apex_validation_orchestrator.py",
        "scripts/verify_evidence_pack.py",
        "scripts/peak_masterpiece_orchestrator.sh"
    ]

    found = 0
    for script in scripts:
        path = Path(script)
        if path.exists():
            executable = path.stat().st_mode & 0o111
            status = "✅ executable" if executable else "⚠️  not executable"
            print(f"   {status} {script}", flush=True)
            found += 1
        else:
            print(f"   ❌ {script} (missing)", flush=True)

    return found == len(scripts), {"found": found, "total": len(scripts)}

def check_makefile():
    print("\n[4/6] 🔨 Checking Makefile Integration...", flush=True)
    makefile = Path("Makefile")

    if not makefile.exists():
        print("   ❌ Makefile not found", flush=True)
        return False, {}

    content = makefile.read_text()
    checks = {
        "validate-apex": "validate-apex:" in content,
        "verify-evidence": "verify-evidence:" in content,
        ".PHONY": "validate-apex" in content and "verify-evidence" in content
    }

    for check, found in checks.items():
        status = "✅" if found else "❌"
        print(f"   {status} {check}", flush=True)

    all_found = all(checks.values())
    return all_found, {"checks": checks}

def check_directory_structure():
    print("\n[5/6] 📁 Checking Directory Structure...", flush=True)
    dirs = {
        "docs/evidence/validation": "Evidence pack storage",
        "docs/evidence/receipts": "Receipt storage",
        "scripts": "Validation scripts",
        "src": "Rust source code"
    }

    found = 0
    for dir_path, description in dirs.items():
        path = Path(dir_path)
        if path.exists() and path.is_dir():
            print(f"   ✅ {dir_path} ({description})", flush=True)
            found += 1
        else:
            print(f"   ⚠️  {dir_path} (not found)", flush=True)

    return found >= 3, {"found": found, "total": len(dirs)}

def calculate_ihsan(results):
    print("\n[6/6] 📊 Calculating Ihsān Score...", flush=True)
    total_checks = len(results)
    passed_checks = sum(1 for r in results if r[0])

    ihsan = passed_checks / total_checks if total_checks > 0 else 0.0
    snr = passed_checks / total_checks if total_checks > 0 else 0.0

    print(f"   Checks passed: {passed_checks}/{total_checks}", flush=True)
    print(f"   Ihsān Score: {ihsan:.3f}", flush=True)
    print(f"   SNR: {snr:.3f}", flush=True)

    return ihsan, snr

def print_summary(results, ihsan, snr):
    print("\n" + "="*80, flush=True)
    print("VALIDATION SUMMARY", flush=True)
    print("="*80, flush=True)

    print(f"Ihsān Score:  {ihsan:.3f} {'✅ PASS' if ihsan >= 0.95 else '❌ FAIL'} (target: ≥ 0.95)", flush=True)
    print(f"SNR:          {snr:.3f} {'✅ PASS' if snr >= 0.90 else '⚠️  WARN'} (target: ≥ 0.90)", flush=True)

    print("\n" + "-"*80, flush=True)
    print("VALIDATION RESULTS", flush=True)
    print("-"*80, flush=True)

    for i, (success, _) in enumerate(results, 1):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{i}. {status}", flush=True)

    print("\n" + "="*80, flush=True)

    if ihsan >= 0.95 and snr >= 0.90:
        print("🏆 DEMONSTRATION COMPLETE - SYSTEM VALIDATED", flush=True)
    else:
        print("⚠️  DEMONSTRATION COMPLETE - REVIEW REQUIRED", flush=True)

    print("="*80, flush=True)
    print("\nالحمد لله - All praise belongs to Allah", flush=True)
    print("\nNext steps:", flush=True)
    print("  • Run full validation: make validate-apex", flush=True)
    print("  • Read guide: APEX_VALIDATION_GUIDE.md", flush=True)
    print("  • Read synthesis: PEAK_MASTERPIECE_SYNTHESIS_v10.md", flush=True)
    print()

def main():
    print_banner()

    # Run checks
    results = [
        check_git_state(),
        check_documentation(),
        check_scripts(),
        check_makefile(),
        check_directory_structure()
    ]

    # Calculate metrics
    ihsan, snr = calculate_ihsan(results)

    # Print summary
    print_summary(results, ihsan, snr)

    # Exit code
    sys.exit(0 if ihsan >= 0.95 else 1)

if __name__ == "__main__":
    main()
