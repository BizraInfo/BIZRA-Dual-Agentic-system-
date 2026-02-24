"""
SAPE OMEGA Demonstration
The Ultimate Proof of Mastery

This module provides live demonstrations of the OMEGA system's capabilities,
generating cryptographic evidence of elite-level performance.

Philosophy: "The proof is in the execution, not the promise."
"""

import asyncio
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from .omega_orchestrator import (
    OmegaOrchestrator,
    OmegaMission,
    OmegaResult,
    PerspectiveLens,
)


class OmegaDemonstration:
    """
    Live demonstration system for SAPE OMEGA

    Executes predefined elite-level missions and generates proof artifacts
    """

    def __init__(self, output_dir: str = "omega_proofs"):
        self.orchestrator = OmegaOrchestrator(enable_federation=False)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    async def run_full_demonstration(self) -> Dict[str, Any]:
        """
        Run the complete demonstration suite

        Returns: Summary of all demonstrations with evidence hashes
        """
        print("\n" + "="*80)
        print("🎯 SAPE OMEGA - FULL DEMONSTRATION SUITE")
        print("="*80)
        print("\nExecuting 3 elite-level missions to prove mastery...")
        print()

        demonstrations = [
            await self.demo_consensus_algorithm(),
            await self.demo_security_analysis(),
            await self.demo_knowledge_synthesis(),
        ]

        # Generate summary
        summary = {
            "demonstration_suite": "SAPE OMEGA Full Proof",
            "executed_at": datetime.utcnow().isoformat(),
            "total_missions": len(demonstrations),
            "all_passed": all(d["passed"] for d in demonstrations),
            "demonstrations": demonstrations,
            "aggregate_metrics": {
                "avg_snr": sum(d["snr_score"] for d in demonstrations) / len(demonstrations),
                "avg_ihsan": sum(d["ihsan_score"] for d in demonstrations) / len(demonstrations),
                "total_execution_time_ms": sum(d["execution_time_ms"] for d in demonstrations),
            }
        }

        # Save summary
        summary_path = self.output_dir / f"demonstration_summary_{int(datetime.utcnow().timestamp())}.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)

        print("\n" + "="*80)
        print("✨ DEMONSTRATION SUITE COMPLETE")
        print("="*80)
        print(f"\n📊 Summary:")
        print(f"   Total Missions:    {summary['total_missions']}")
        print(f"   All Passed:        {'✅' if summary['all_passed'] else '❌'}")
        print(f"   Avg SNR:           {summary['aggregate_metrics']['avg_snr']:.6f}")
        print(f"   Avg Ihsān:         {summary['aggregate_metrics']['avg_ihsan']:.6f}")
        print(f"   Total Time:        {summary['aggregate_metrics']['total_execution_time_ms']}ms")
        print(f"\n💾 Summary saved to: {summary_path}\n")

        return summary

    async def demo_consensus_algorithm(self) -> Dict[str, Any]:
        """Demonstration 1: Byzantine Fault-Tolerant Consensus"""
        print("\n" + "-"*80)
        print("📋 Demo 1: Byzantine Fault-Tolerant Consensus Algorithm")
        print("-"*80)

        mission = OmegaMission(
            mission_id="DEMO-CONSENSUS-001",
            query="Design a Byzantine fault-tolerant consensus algorithm for distributed AI agents with formal verification",
        )

        result = await self.orchestrator.execute_mission(mission)

        # Save proof
        proof_path = self.output_dir / f"{result.mission_id}_proof.json"
        with open(proof_path, 'w') as f:
            json.dump(result.to_dict(), f, indent=2)

        passed = result.snr_score >= 0.995 and result.ihsan_score >= 0.997

        print(f"\n{'✅ PASSED' if passed else '❌ FAILED'}")
        print(f"SNR: {result.snr_score:.6f} | Ihsān: {result.ihsan_score:.6f}")
        print(f"Evidence: {result.evidence_hash}")
        print(f"Proof saved: {proof_path}")

        return {
            "mission_id": result.mission_id,
            "query": result.query,
            "passed": passed,
            "snr_score": result.snr_score,
            "ihsan_score": result.ihsan_score,
            "evidence_hash": result.evidence_hash,
            "execution_time_ms": result.execution_time_ms,
            "proof_file": str(proof_path),
        }

    async def demo_security_analysis(self) -> Dict[str, Any]:
        """Demonstration 2: Multi-Vector Security Analysis"""
        print("\n" + "-"*80)
        print("📋 Demo 2: Multi-Vector Security Analysis")
        print("-"*80)

        mission = OmegaMission(
            mission_id="DEMO-SECURITY-001",
            query="Perform comprehensive security analysis of a blockchain smart contract system with adversarial testing",
            required_lenses=[
                PerspectiveLens.ADVERSARIAL,
                PerspectiveLens.FORMAL,
                PerspectiveLens.ETHICAL,
                PerspectiveLens.SYSTEMS,
            ],
        )

        result = await self.orchestrator.execute_mission(mission)

        # Save proof
        proof_path = self.output_dir / f"{result.mission_id}_proof.json"
        with open(proof_path, 'w') as f:
            json.dump(result.to_dict(), f, indent=2)

        passed = result.snr_score >= 0.995 and result.ihsan_score >= 0.997

        print(f"\n{'✅ PASSED' if passed else '❌ FAILED'}")
        print(f"SNR: {result.snr_score:.6f} | Ihsān: {result.ihsan_score:.6f}")
        print(f"Evidence: {result.evidence_hash}")
        print(f"Proof saved: {proof_path}")

        return {
            "mission_id": result.mission_id,
            "query": result.query,
            "passed": passed,
            "snr_score": result.snr_score,
            "ihsan_score": result.ihsan_score,
            "evidence_hash": result.evidence_hash,
            "execution_time_ms": result.execution_time_ms,
            "proof_file": str(proof_path),
        }

    async def demo_knowledge_synthesis(self) -> Dict[str, Any]:
        """Demonstration 3: Multi-Dimensional Knowledge Synthesis"""
        print("\n" + "-"*80)
        print("📋 Demo 3: Multi-Dimensional Knowledge Synthesis")
        print("-"*80)

        mission = OmegaMission(
            mission_id="DEMO-SYNTHESIS-001",
            query="Synthesize insights from Graph-of-Thoughts reasoning, empirical data analysis, and formal proofs into unified knowledge",
        )

        result = await self.orchestrator.execute_mission(mission)

        # Save proof
        proof_path = self.output_dir / f"{result.mission_id}_proof.json"
        with open(proof_path, 'w') as f:
            json.dump(result.to_dict(), f, indent=2)

        passed = result.snr_score >= 0.995 and result.ihsan_score >= 0.997

        print(f"\n{'✅ PASSED' if passed else '❌ FAILED'}")
        print(f"SNR: {result.snr_score:.6f} | Ihsān: {result.ihsan_score:.6f}")
        print(f"Evidence: {result.evidence_hash}")
        print(f"Proof saved: {proof_path}")

        return {
            "mission_id": result.mission_id,
            "query": result.query,
            "passed": passed,
            "snr_score": result.snr_score,
            "ihsan_score": result.ihsan_score,
            "evidence_hash": result.evidence_hash,
            "execution_time_ms": result.execution_time_ms,
            "proof_file": str(proof_path),
        }


# CLI entry point for standalone demonstration
async def main():
    """Run standalone demonstration"""
    demo = OmegaDemonstration()
    summary = await demo.run_full_demonstration()

    # Print final verdict
    print("\n" + "="*80)
    print("🏆 FINAL VERDICT")
    print("="*80)

    if summary["all_passed"]:
        print("\n✅ ALL DEMONSTRATIONS PASSED")
        print("\nSAPE OMEGA has proven elite-level mastery:")
        print(f"  • SNR ≥ 0.995: {summary['aggregate_metrics']['avg_snr']:.6f}")
        print(f"  • Ihsān ≥ 0.997: {summary['aggregate_metrics']['avg_ihsan']:.6f}")
        print(f"  • Cryptographic proof generated for all missions")
        print(f"  • Total execution: {summary['aggregate_metrics']['total_execution_time_ms']}ms")
        print("\n🎯 System Status: PRODUCTION READY")
    else:
        print("\n❌ SOME DEMONSTRATIONS FAILED")
        print("\nReview individual proofs for failure analysis")
        print("\n⚠️  System Status: REQUIRES ATTENTION")

    print("\nالحمد لله - All praise belongs to Allah")
    print()


if __name__ == "__main__":
    asyncio.run(main())
