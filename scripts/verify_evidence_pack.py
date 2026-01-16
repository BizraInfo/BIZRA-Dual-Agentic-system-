#!/usr/bin/env python3
"""
BIZRA Evidence Pack Verifier
Independent verification of APEX validation evidence

This script can be run by third parties to verify evidence packs
without requiring access to the full codebase or build environment.

Usage:
    python3 verify_evidence_pack.py <evidence_pack.json>
"""

import argparse
import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict


class EvidenceVerifier:
    """Independent verifier for BIZRA evidence packs"""

    def __init__(self, evidence_path: Path):
        self.evidence_path = evidence_path
        self.evidence_data = None

    def load_evidence(self) -> bool:
        """Load and parse evidence pack"""
        try:
            with open(self.evidence_path) as f:
                self.evidence_data = json.load(f)
            return True
        except Exception as e:
            print(f"❌ Failed to load evidence pack: {e}")
            return False

    def verify_structure(self) -> bool:
        """Verify evidence pack has required structure"""
        required_fields = [
            "version",
            "timestamp",
            "git_commit",
            "git_branch",
            "validation_results",
            "aggregate_ihsan",
            "aggregate_snr",
            "test_count",
            "receipt_count",
            "evidence_hash"
        ]

        for field in required_fields:
            if field not in self.evidence_data:
                print(f"❌ Missing required field: {field}")
                return False

        print(f"✅ Evidence pack structure valid")
        return True

    def verify_hash(self) -> bool:
        """Verify evidence pack hash for tamper detection"""
        stored_hash = self.evidence_data.get("evidence_hash", "")

        # Create a copy without the hash field for verification
        data_copy = self.evidence_data.copy()
        data_copy["evidence_hash"] = ""

        # Recalculate hash
        pack_json = json.dumps(data_copy, indent=2, sort_keys=True)
        calculated_hash = hashlib.sha256(pack_json.encode()).hexdigest()

        if calculated_hash == stored_hash:
            print(f"✅ Evidence hash verified: {stored_hash[:16]}...")
            return True
        else:
            print(f"❌ Evidence hash mismatch!")
            print(f"   Stored:     {stored_hash[:16]}...")
            print(f"   Calculated: {calculated_hash[:16]}...")
            return False

    def verify_ihsan_threshold(self) -> bool:
        """Verify Ihsān score meets threshold"""
        ihsan = self.evidence_data.get("aggregate_ihsan", 0.0)
        threshold = 0.95

        if ihsan >= threshold:
            print(f"✅ Ihsān score: {ihsan:.3f} (≥ {threshold} required)")
            return True
        else:
            print(f"❌ Ihsān score: {ihsan:.3f} (< {threshold} required)")
            return False

    def verify_snr_threshold(self) -> bool:
        """Verify SNR meets threshold"""
        snr = self.evidence_data.get("aggregate_snr", 0.0)
        threshold = 0.90

        if snr >= threshold:
            print(f"✅ SNR: {snr:.3f} (≥ {threshold} required)")
            return True
        else:
            print(f"⚠️  SNR: {snr:.3f} (< {threshold} target)")
            return False  # Warning, not failure

    def verify_test_count(self) -> bool:
        """Verify test count meets gate requirement"""
        test_count = self.evidence_data.get("test_count", 0)
        threshold = 76

        if test_count >= threshold:
            print(f"✅ Test count: {test_count} (≥ {threshold} required)")
            return True
        else:
            print(f"❌ Test count: {test_count} (< {threshold} required)")
            return False

    def verify_validation_steps(self) -> bool:
        """Verify all validation steps completed successfully"""
        results = self.evidence_data.get("validation_results", [])

        if not results:
            print(f"❌ No validation results found")
            return False

        failed_steps = [r for r in results if not r.get("success", False)]

        if failed_steps:
            print(f"⚠️  {len(failed_steps)} validation step(s) failed:")
            for step in failed_steps:
                print(f"   - {step.get('step', 'unknown')}")

        print(f"✅ {len(results)} validation steps executed")
        return len(failed_steps) == 0

    def print_summary(self):
        """Print verification summary"""
        print("\n" + "="*80)
        print("EVIDENCE PACK VERIFICATION SUMMARY")
        print("="*80)
        print(f"Evidence File: {self.evidence_path.name}")
        print(f"Version: {self.evidence_data.get('version', 'UNKNOWN')}")
        print(f"Branch: {self.evidence_data.get('git_branch', 'UNKNOWN')}")
        print(f"Commit: {self.evidence_data.get('git_commit', 'UNKNOWN')}")
        print(f"Timestamp: {self.evidence_data.get('timestamp', 'UNKNOWN')}")
        print("="*80)

    def verify(self) -> bool:
        """Run complete verification"""
        print("\n🔍 BIZRA Evidence Pack Verifier\n")

        if not self.load_evidence():
            return False

        self.print_summary()
        print()

        # Run all verifications
        checks = [
            ("Structure", self.verify_structure()),
            ("Hash Integrity", self.verify_hash()),
            ("Ihsān Threshold", self.verify_ihsan_threshold()),
            ("SNR Threshold", self.verify_snr_threshold()),
            ("Test Gate", self.verify_test_count()),
            ("Validation Steps", self.verify_validation_steps())
        ]

        print("\n" + "-"*80)
        print("VERIFICATION RESULTS")
        print("-"*80)

        for check_name, passed in checks:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{check_name:<20} {status}")

        print("-"*80)

        all_passed = all(passed for _, passed in checks)

        if all_passed:
            print("\n🏆 ALL VERIFICATIONS PASSED")
            print("="*80)
            print("\nالحمد لله - Evidence pack verified\n")
            return True
        else:
            print("\n❌ VERIFICATION FAILED")
            print("="*80)
            print("\nReview failed checks above.\n")
            return False


def main():
    parser = argparse.ArgumentParser(
        description="Verify BIZRA evidence pack integrity and compliance"
    )
    parser.add_argument(
        "evidence_pack",
        type=str,
        help="Path to evidence pack JSON file"
    )

    args = parser.parse_args()
    evidence_path = Path(args.evidence_pack)

    if not evidence_path.exists():
        print(f"❌ Evidence pack not found: {evidence_path}")
        sys.exit(1)

    verifier = EvidenceVerifier(evidence_path)
    success = verifier.verify()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
