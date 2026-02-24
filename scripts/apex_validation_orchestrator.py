#!/usr/bin/env python3
"""
BIZRA APEX Validation Orchestrator
Peak Masterpiece Evidence Generation System

Embodies:
- Graph of Thoughts: Multi-dimensional validation paths
- Interdisciplinary: Software + Crypto + Philosophy + PM
- Standing on Giants: Leverages FATE, receipts, metrics
- SNR Optimization: Maximum proof, minimum noise
- Professional Elite: Reproducible evidence packs

THE LAW: "We don't assume. If we must, we do it with Ihsān."
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import hashlib


@dataclass
class ValidationResult:
    """Evidence of a validation step"""
    step: str
    success: bool
    duration_ms: float
    evidence: Dict
    timestamp: str
    ihsan_score: Optional[float] = None


@dataclass
class ApexEvidencePack:
    """Complete evidence pack for BIZRA Peak Masterpiece"""
    version: str
    timestamp: str
    git_commit: str
    git_branch: str
    validation_results: List[ValidationResult]
    aggregate_ihsan: float
    aggregate_snr: float
    test_count: int
    receipt_count: int
    evidence_hash: str
    reproducible: bool


class ApexValidationOrchestrator:
    """
    Peak Masterpiece Validation Orchestrator

    Standing on Shoulders of Giants:
    - FATE Engine (formal verification)
    - Third Fact Receipts (cryptographic evidence)
    - Ihsān Metrics (quality scoring)
    - SNR Calculation (signal-to-noise ratio)
    """

    def __init__(self, bizra_root: Path):
        self.bizra_root = bizra_root
        self.validation_results: List[ValidationResult] = []
        self.start_time = datetime.utcnow()
        self.evidence_dir = bizra_root / "docs" / "evidence" / "validation"
        self.evidence_dir.mkdir(parents=True, exist_ok=True)

    def print_banner(self):
        """Display the APEX validation banner"""
        banner = """
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║          ██████╗ ██╗███████╗██████╗  █████╗                               ║
║          ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗                             ║
║          ██████╔╝██║  ███╔╝ ██████╔╝███████║                             ║
║          ██╔══██╗██║ ███╔╝  ██╔══██╗██╔══██║                             ║
║          ██████╔╝██║███████╗██║  ██║██║  ██║                             ║
║          ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝                             ║
║                                                                            ║
║                    APEX VALIDATION ORCHESTRATOR                           ║
║                    Peak Masterpiece Evidence Generation                   ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

THE LAW: "We don't assume. If we must, we do it with Ihsān."

"""
        print(banner)

    async def run_command(self, cmd: List[str], timeout: int = 300) -> Tuple[bool, str, str]:
        """Execute a command and capture output"""
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.bizra_root
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )

            success = process.returncode == 0
            return success, stdout.decode('utf-8'), stderr.decode('utf-8')

        except asyncio.TimeoutError:
            return False, "", f"Command timed out after {timeout}s"
        except Exception as e:
            return False, "", str(e)

    def calculate_ihsan_score(self, success_rate: float, performance_factor: float = 1.0) -> float:
        """
        Calculate Ihsān score (إحسان - perfection/excellence)
        Target: ≥ 0.95
        """
        base_score = success_rate * 0.7 + performance_factor * 0.3
        # Apply Ihsān threshold: must be excellent or needs improvement
        if base_score >= 0.95:
            return min(1.0, base_score)
        else:
            # Penalty for not meeting excellence threshold
            return base_score * 0.9

    def calculate_snr(self, signal_data: int, noise_data: int) -> float:
        """
        Calculate Signal-to-Noise Ratio
        Target: ≥ 0.98
        """
        if signal_data + noise_data == 0:
            return 0.0
        return signal_data / (signal_data + noise_data)

    async def validate_git_state(self) -> ValidationResult:
        """Validate git state and capture commit info"""
        print("\n[1/8] 🔍 Validating Git State...")
        start = time.time()

        # Get current commit
        success, commit, _ = await self.run_command(["git", "rev-parse", "HEAD"])
        commit = commit.strip() if success else "UNKNOWN"

        # Get current branch
        success2, branch, _ = await self.run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"])
        branch = branch.strip() if success2 else "UNKNOWN"

        # Get git status
        success3, status, _ = await self.run_command(["git", "status", "--porcelain"])

        modified_files = len(status.strip().split('\n')) if status.strip() else 0

        duration = (time.time() - start) * 1000

        result = ValidationResult(
            step="git_state",
            success=success and success2 and success3,
            duration_ms=duration,
            evidence={
                "commit": commit[:8],
                "branch": branch,
                "modified_files": modified_files,
                "clean_working_tree": modified_files == 0
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=1.0 if success and success2 and success3 else 0.0
        )

        print(f"   ✅ Branch: {branch}")
        print(f"   ✅ Commit: {commit[:8]}")
        print(f"   ⚠️  Modified files: {modified_files}")

        self.validation_results.append(result)
        return result

    async def validate_documentation(self) -> ValidationResult:
        """Validate documentation files exist and are accessible"""
        print("\n[2/8] 📚 Validating Documentation...")
        start = time.time()

        critical_docs = [
            "CLAUDE.md",
            "START_HERE.md",
            "README.md",
            "BIZRA_SOT.md",
            "RUN_MONEY_SHOT.md",
            "PEAK_MASTERPIECE_MONEY_SHOT.md"
        ]

        found_docs = []
        missing_docs = []

        for doc in critical_docs:
            doc_path = self.bizra_root / doc
            if doc_path.exists():
                found_docs.append(doc)
                print(f"   ✅ {doc}")
            else:
                missing_docs.append(doc)
                print(f"   ❌ {doc} (missing)")

        duration = (time.time() - start) * 1000
        success_rate = len(found_docs) / len(critical_docs)

        result = ValidationResult(
            step="documentation",
            success=len(missing_docs) == 0,
            duration_ms=duration,
            evidence={
                "found": found_docs,
                "missing": missing_docs,
                "success_rate": success_rate
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=self.calculate_ihsan_score(success_rate)
        )

        self.validation_results.append(result)
        return result

    async def validate_rust_build(self) -> ValidationResult:
        """Validate Rust compilation"""
        print("\n[3/8] 🦀 Validating Rust Build...")
        start = time.time()

        print("   Building with cargo...")
        success, stdout, stderr = await self.run_command(
            ["cargo", "build", "--release", "--all-features"],
            timeout=600
        )

        duration = (time.time() - start) * 1000

        # Check for binary
        binary_path = self.bizra_root / "target" / "release" / "meta_alpha_dual_agentic"
        binary_exists = binary_path.exists()

        result = ValidationResult(
            step="rust_build",
            success=success and binary_exists,
            duration_ms=duration,
            evidence={
                "binary_exists": binary_exists,
                "binary_path": str(binary_path) if binary_exists else None,
                "stderr_lines": len(stderr.split('\n')) if stderr else 0
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=1.0 if success and binary_exists else 0.0
        )

        if success and binary_exists:
            print(f"   ✅ Build successful (duration: {duration:.0f}ms)")
            print(f"   ✅ Binary: {binary_path}")
        else:
            print(f"   ❌ Build failed")
            if stderr:
                print(f"   Error preview: {stderr[:200]}")

        self.validation_results.append(result)
        return result

    async def validate_rust_tests(self) -> ValidationResult:
        """Run Rust test suite and validate 76+ tests pass"""
        print("\n[4/8] 🧪 Running Rust Test Suite...")
        start = time.time()

        print("   Running cargo test...")
        success, stdout, stderr = await self.run_command(
            ["cargo", "test", "--all-features", "--", "--nocapture"],
            timeout=600
        )

        duration = (time.time() - start) * 1000

        # Parse test results
        test_count = 0
        for line in stdout.split('\n'):
            if 'test result:' in line and 'passed' in line:
                # Extract: "test result: ok. 76 passed; 0 failed"
                parts = line.split()
                for i, part in enumerate(parts):
                    if part == 'passed' and i > 0:
                        try:
                            test_count = int(parts[i-1])
                            break
                        except ValueError:
                            pass

        gate_passed = test_count >= 76

        result = ValidationResult(
            step="rust_tests",
            success=success and gate_passed,
            duration_ms=duration,
            evidence={
                "test_count": test_count,
                "gate_threshold": 76,
                "gate_passed": gate_passed,
                "test_output_lines": len(stdout.split('\n'))
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=1.0 if gate_passed else (test_count / 76.0)
        )

        if gate_passed:
            print(f"   ✅ {test_count} tests passed (≥ 76 required)")
        else:
            print(f"   ❌ {test_count} tests passed (< 76 required)")

        self.validation_results.append(result)
        return result

    async def validate_receipts(self) -> ValidationResult:
        """Validate cryptographic receipt system"""
        print("\n[5/8] 🔐 Validating Receipt System...")
        start = time.time()

        receipts_dir = self.bizra_root / "docs" / "evidence" / "receipts"

        if not receipts_dir.exists():
            result = ValidationResult(
                step="receipts",
                success=False,
                duration_ms=(time.time() - start) * 1000,
                evidence={"error": "receipts directory not found"},
                timestamp=datetime.utcnow().isoformat(),
                ihsan_score=0.0
            )
            print(f"   ❌ Receipts directory not found")
            self.validation_results.append(result)
            return result

        # Count receipts
        exec_receipts = list(receipts_dir.glob("EXEC-*.json"))
        rej_receipts = list(receipts_dir.glob("REJ-*.json"))
        total_receipts = len(exec_receipts) + len(rej_receipts)

        # Validate structure of a sample receipt
        valid_structure = False
        if exec_receipts:
            try:
                with open(exec_receipts[0]) as f:
                    receipt = json.load(f)
                    required_fields = ["timestamp", "request_id", "user_id"]
                    valid_structure = all(field in receipt for field in required_fields)
            except Exception:
                valid_structure = False

        duration = (time.time() - start) * 1000

        result = ValidationResult(
            step="receipts",
            success=total_receipts > 0 and valid_structure,
            duration_ms=duration,
            evidence={
                "executed": len(exec_receipts),
                "rejected": len(rej_receipts),
                "total": total_receipts,
                "valid_structure": valid_structure
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=1.0 if (total_receipts > 0 and valid_structure) else 0.5
        )

        print(f"   ✅ Executed receipts: {len(exec_receipts)}")
        print(f"   ✅ Rejected receipts: {len(rej_receipts)}")
        print(f"   ✅ Total: {total_receipts}")
        print(f"   {'✅' if valid_structure else '⚠️'} Structure validation: {valid_structure}")

        self.validation_results.append(result)
        return result

    async def validate_knowledge_graph(self) -> ValidationResult:
        """Validate knowledge graph data"""
        print("\n[6/8] 🌳 Validating Knowledge Graph...")
        start = time.time()

        kg_output = self.bizra_root / "knowledge_graph_output"

        if not kg_output.exists():
            result = ValidationResult(
                step="knowledge_graph",
                success=False,
                duration_ms=(time.time() - start) * 1000,
                evidence={"error": "knowledge graph output not found"},
                timestamp=datetime.utcnow().isoformat(),
                ihsan_score=0.0
            )
            print(f"   ⚠️  Knowledge graph output not found (optional)")
            self.validation_results.append(result)
            return result

        # Count nodes
        insights_dir = kg_output / "insights"
        quranic_dir = kg_output / "quranic"

        insight_nodes = len(list(insights_dir.glob("*.json"))) if insights_dir.exists() else 0
        quranic_nodes = len(list(quranic_dir.glob("*.json"))) if quranic_dir.exists() else 0
        total_nodes = insight_nodes + quranic_nodes

        duration = (time.time() - start) * 1000

        result = ValidationResult(
            step="knowledge_graph",
            success=total_nodes > 0,
            duration_ms=duration,
            evidence={
                "insight_nodes": insight_nodes,
                "quranic_nodes": quranic_nodes,
                "total_nodes": total_nodes
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=1.0 if total_nodes > 77000 else (total_nodes / 77000.0)
        )

        print(f"   ✅ Insight nodes: {insight_nodes:,}")
        print(f"   ✅ Quranic nodes: {quranic_nodes:,}")
        print(f"   ✅ Total nodes: {total_nodes:,}")

        self.validation_results.append(result)
        return result

    async def validate_peak_masterpiece_script(self) -> ValidationResult:
        """Validate the peak masterpiece orchestrator script"""
        print("\n[7/8] 🏆 Validating Peak Masterpiece Script...")
        start = time.time()

        script_path = self.bizra_root / "scripts" / "peak_masterpiece_orchestrator.sh"

        if not script_path.exists():
            result = ValidationResult(
                step="peak_script",
                success=False,
                duration_ms=(time.time() - start) * 1000,
                evidence={"error": "peak masterpiece script not found"},
                timestamp=datetime.utcnow().isoformat(),
                ihsan_score=0.0
            )
            print(f"   ❌ Script not found")
            self.validation_results.append(result)
            return result

        # Check script is executable
        is_executable = os.access(script_path, os.X_OK)

        # Validate script structure (basic checks)
        with open(script_path) as f:
            content = f.read()
            has_shebang = content.startswith('#!/')
            has_set_e = 'set -e' in content
            has_bizra_root = 'BIZRA_ROOT' in content

        duration = (time.time() - start) * 1000

        result = ValidationResult(
            step="peak_script",
            success=is_executable and has_shebang and has_set_e,
            duration_ms=duration,
            evidence={
                "exists": True,
                "executable": is_executable,
                "has_shebang": has_shebang,
                "has_error_handling": has_set_e,
                "has_bizra_root": has_bizra_root
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=1.0 if (is_executable and has_shebang and has_set_e) else 0.7
        )

        print(f"   ✅ Script exists: {script_path}")
        print(f"   {'✅' if is_executable else '❌'} Executable: {is_executable}")
        print(f"   {'✅' if has_shebang else '❌'} Shebang: {has_shebang}")
        print(f"   {'✅' if has_set_e else '⚠️'} Error handling: {has_set_e}")

        self.validation_results.append(result)
        return result

    async def generate_evidence_pack(self) -> ValidationResult:
        """Generate comprehensive evidence pack"""
        print("\n[8/8] 📦 Generating Evidence Pack...")
        start = time.time()

        # Calculate aggregate metrics
        total_steps = len(self.validation_results)
        successful_steps = sum(1 for r in self.validation_results if r.success)
        success_rate = successful_steps / total_steps if total_steps > 0 else 0.0

        # Calculate aggregate Ihsān score
        ihsan_scores = [r.ihsan_score for r in self.validation_results if r.ihsan_score is not None]
        aggregate_ihsan = sum(ihsan_scores) / len(ihsan_scores) if ihsan_scores else 0.0

        # Calculate SNR (successful steps as signal, failed as noise)
        aggregate_snr = self.calculate_snr(successful_steps, total_steps - successful_steps)

        # Get git info
        git_result = next((r for r in self.validation_results if r.step == "git_state"), None)
        git_commit = git_result.evidence.get("commit", "UNKNOWN") if git_result else "UNKNOWN"
        git_branch = git_result.evidence.get("branch", "UNKNOWN") if git_result else "UNKNOWN"

        # Get test count
        test_result = next((r for r in self.validation_results if r.step == "rust_tests"), None)
        test_count = test_result.evidence.get("test_count", 0) if test_result else 0

        # Get receipt count
        receipt_result = next((r for r in self.validation_results if r.step == "receipts"), None)
        receipt_count = receipt_result.evidence.get("total", 0) if receipt_result else 0

        # Create evidence pack
        evidence_pack = ApexEvidencePack(
            version="v10.0-OMEGA-PEAK",
            timestamp=self.start_time.isoformat(),
            git_commit=git_commit,
            git_branch=git_branch,
            validation_results=self.validation_results,
            aggregate_ihsan=aggregate_ihsan,
            aggregate_snr=aggregate_snr,
            test_count=test_count,
            receipt_count=receipt_count,
            evidence_hash="",  # Will be calculated
            reproducible=True
        )

        # Serialize and hash
        pack_dict = asdict(evidence_pack)
        pack_json = json.dumps(pack_dict, indent=2, sort_keys=True)
        evidence_hash = hashlib.sha256(pack_json.encode()).hexdigest()
        evidence_pack.evidence_hash = evidence_hash

        # Save evidence pack
        pack_path = self.evidence_dir / f"apex_validation_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        with open(pack_path, 'w') as f:
            json.dump(asdict(evidence_pack), f, indent=2)

        duration = (time.time() - start) * 1000

        result = ValidationResult(
            step="evidence_pack",
            success=True,
            duration_ms=duration,
            evidence={
                "pack_path": str(pack_path),
                "evidence_hash": evidence_hash[:16],
                "aggregate_ihsan": round(aggregate_ihsan, 3),
                "aggregate_snr": round(aggregate_snr, 3),
                "success_rate": round(success_rate, 3)
            },
            timestamp=datetime.utcnow().isoformat(),
            ihsan_score=aggregate_ihsan
        )

        print(f"   ✅ Evidence pack generated: {pack_path.name}")
        print(f"   ✅ Evidence hash: {evidence_hash[:16]}...")

        self.validation_results.append(result)
        return result, evidence_pack

    def print_summary(self, evidence_pack: ApexEvidencePack):
        """Print validation summary"""
        print("\n" + "="*80)
        print("APEX VALIDATION SUMMARY")
        print("="*80)
        print(f"Version: {evidence_pack.version}")
        print(f"Branch: {evidence_pack.git_branch}")
        print(f"Commit: {evidence_pack.git_commit}")
        print(f"Timestamp: {evidence_pack.timestamp}")
        print("\n" + "-"*80)
        print("METRICS")
        print("-"*80)
        print(f"Ihsān Score:  {evidence_pack.aggregate_ihsan:.3f} {'✅ PASS' if evidence_pack.aggregate_ihsan >= 0.95 else '❌ FAIL'} (target: ≥ 0.95)")
        print(f"SNR:          {evidence_pack.aggregate_snr:.3f} {'✅ PASS' if evidence_pack.aggregate_snr >= 0.90 else '⚠️  WARN'} (target: ≥ 0.90)")
        print(f"Tests Passed: {evidence_pack.test_count} {'✅ PASS' if evidence_pack.test_count >= 76 else '❌ FAIL'} (target: ≥ 76)")
        print(f"Receipts:     {evidence_pack.receipt_count:,}")

        print("\n" + "-"*80)
        print("VALIDATION STEPS")
        print("-"*80)

        for i, result in enumerate(evidence_pack.validation_results, 1):
            status = "✅" if result.success else "❌"
            ihsan = f"Ihsān: {result.ihsan_score:.2f}" if result.ihsan_score is not None else ""
            print(f"{i}. {status} {result.step:<20} {result.duration_ms:>8.0f}ms  {ihsan}")

        print("\n" + "-"*80)
        print("EVIDENCE HASH")
        print("-"*80)
        print(f"{evidence_pack.evidence_hash}")

        print("\n" + "="*80)

        # Overall verdict
        all_pass = (
            evidence_pack.aggregate_ihsan >= 0.95 and
            evidence_pack.aggregate_snr >= 0.90 and
            evidence_pack.test_count >= 76
        )

        if all_pass:
            print("🏆 PEAK MASTERPIECE VALIDATED - ALL GATES PASSED")
        else:
            print("⚠️  VALIDATION INCOMPLETE - REVIEW REQUIRED")

        print("="*80)
        print("\nالحمد لله - All praise belongs to Allah")
        print()

    async def orchestrate(self):
        """Run the complete validation orchestration"""
        self.print_banner()

        # Run validation steps
        await self.validate_git_state()
        await self.validate_documentation()
        await self.validate_rust_build()
        await self.validate_rust_tests()
        await self.validate_receipts()
        await self.validate_knowledge_graph()
        await self.validate_peak_masterpiece_script()
        result, evidence_pack = await self.generate_evidence_pack()

        # Print summary
        self.print_summary(evidence_pack)

        return evidence_pack


async def main():
    """Main entry point"""
    bizra_root = Path(__file__).parent.parent

    orchestrator = ApexValidationOrchestrator(bizra_root)
    evidence_pack = await orchestrator.orchestrate()

    # Exit with appropriate code
    if evidence_pack.aggregate_ihsan >= 0.95 and evidence_pack.test_count >= 76:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
