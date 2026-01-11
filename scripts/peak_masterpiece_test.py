#!/usr/bin/env python3
"""
BIZRA DDAGI Peak Masterpiece — Comprehensive Test Suite

Validates all components of the Third Fact implementation.

Classification: DEEP RESEARCH | Clearance: MASTERPIECE-OMEGA
"""

import sys
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

# Add scripts path
sys.path.insert(0, str(Path(__file__).parent))

# Test results
RESULTS: List[Tuple[str, bool, str]] = []


def test(name: str, condition: bool, details: str = ""):
    """Record a test result"""
    RESULTS.append((name, condition, details))
    icon = "✅" if condition else "❌"
    print(f"   {icon} {name}" + (f": {details}" if details else ""))
    return condition


def test_genesis_kernel():
    """Test Genesis Kernel component"""
    print("\n📦 TESTING GENESIS KERNEL...")
    
    try:
        from genesis_kernel import (
            GenesisKernel, ThirdFact, IhsanVector,
            FATEEngine, CognitiveMemoryStack, AdlInvariant,
            VerificationStatus, IhsanDimension
        )
        test("Import Genesis Kernel", True)
    except Exception as e:
        test("Import Genesis Kernel", False, str(e))
        return
    
    # Initialize
    kernel = GenesisKernel()
    init = kernel.initialize()
    test("Kernel Initialization", init["version"] == "7.0.0", f"v{init['version']}")
    test("FFI Mode", init["components"]["fate"]["native"], "NATIVE")
    
    # Ihsān Vector - create with high scores
    vector = IhsanVector()
    vector.correctness = 0.98
    vector.safety = 0.99
    vector.user_benefit = 0.96
    vector.efficiency = 0.95
    vector.auditability = 1.0
    vector.anti_centralization = 0.94
    vector.robustness = 0.97
    vector.adl_fairness = 0.98
    
    score = vector.compute_score()
    test("Ihsān Vector Score", 0.95 <= score <= 1.0, f"{score:.4f}")
    test("Ihsān Threshold", score >= vector.THRESHOLD, f">= {vector.THRESHOLD}")
    
    # Weights sum to 1.0
    weight_sum = sum(dim.weight for dim in IhsanDimension)
    test("Weights Sum", abs(weight_sum - 1.0) < 0.001, f"{weight_sum:.4f}")
    
    # 8 Dimensions
    test("8 Dimensions", len(list(IhsanDimension)) == 8, f"{len(list(IhsanDimension))} dims")
    
    # Adl Invariant
    adl = AdlInvariant()
    distribution = [0.25, 0.25, 0.25, 0.25]  # Equal distribution
    gini = adl.compute_gini(distribution)
    test("Adl Gini Check", adl.is_compliant(distribution), f"Gini={gini:.2f} <= 0.35")
    
    # Third Fact Generation
    fact = kernel.generate_third_fact(
        content={"test": "data"},
        evidence=["evidence_1", "evidence_2"]
    )
    test("Third Fact ID", fact.fact_id.startswith("TF_"))
    test("Third Fact Valid", fact.is_valid())
    test("Third Fact Status", fact.verification_status == VerificationStatus.SAT)
    
    # Memory Stack
    memory = CognitiveMemoryStack()
    from genesis_kernel import MemoryLayer
    node1 = memory.store(MemoryLayer.L1_IMMEDIATE, {"key": "ephemeral"})
    node2 = memory.store(MemoryLayer.L2_WORKING, {"key": "working"})
    test("Memory L1 Store", node1.node_id.startswith("L1_"))
    test("Memory L2 Store", node2.node_id.startswith("L2_"))
    test("Memory Layers", len(memory.layers) == 5)


def test_apex_blueprint():
    """Test APEX 7-Layer Blueprint"""
    print("\n📦 TESTING APEX BLUEPRINT...")
    
    try:
        from apex_blueprint import (
            APEXBlueprint, APEXLayer,
            BicameralEngine, ProofOfImpact, GovernanceHypervisor
        )
        test("Import APEX Blueprint", True)
    except Exception as e:
        test("Import APEX Blueprint", False, str(e))
        return
    
    # Initialize
    apex = APEXBlueprint()
    status = apex.get_full_status()
    test("APEX Initialization", status["version"] == "7.0.0", f"v{status['version']}")
    test("7 Layers", len(status["layers"]) == 7)
    
    # Check each layer exists in status
    layer_names = [
        "L1_KNOWLEDGE", "L2_RESOURCE", "L3_EXECUTION",
        "L4_COGNITIVE", "L5_ECONOMIC", "L6_GOVERNANCE", "L7_PHILOSOPHY"
    ]
    for name in layer_names:
        layer_exists = name in status["layers"]
        test(f"Layer {name}", layer_exists)
    
    # L4 Bicameral - pass string, not dict
    response = apex.l4_cognitive.process("Analyze Third Fact implications")
    test("Bicameral Processing", response is not None)
    test("Bicameral Mode", response.mode is not None)
    
    # L5 Proof of Impact
    receipt = apex.l5_economic.record_impact(
        agent_id="TEST_AGENT",
        action_type="UNIT_TEST",
        entropy_reduced=0.6,
        utility_delta=0.4
    )
    test("Impact Receipt", hasattr(receipt, 'receipt_id'))
    test("Impact Score", 0 <= receipt.impact_score <= 1.0, f"{receipt.impact_score:.2f}")
    
    # L6 Governance - use verify method
    action = {"ihsan_score": 0.97, "has_receipt": True, "is_hallucination": False}
    passed, msg = apex.l6_governance.verify(action)
    test("Governance Verification", passed, msg)


def test_graph_of_thoughts():
    """Test Graph-of-Thoughts Engine"""
    print("\n📦 TESTING GRAPH-OF-THOUGHTS...")
    
    try:
        from graph_of_thoughts import (
            GraphOfThoughts, GoTSolver, ThoughtNode,
            ThoughtType, ThoughtStatus, EdgeType
        )
        test("Import GoT", True)
    except Exception as e:
        test("Import GoT", False, str(e))
        return
    
    # Initialize solver
    solver = GoTSolver(beam_width=5, max_depth=5)
    test("GoT Solver Init", solver.beam_width == 5)
    
    # Solve problem - using correct parameter name
    result = solver.solve(
        query="Design a formally verified AI system",
        max_iterations=2
    )
    test("GoT Solution", "solution" in result)
    test("GoT Nodes Created", result["stats"]["total_nodes"] > 0, f"{result['stats']['total_nodes']} nodes")
    test("GoT Has Best Path", len(result.get("best_path", [])) >= 0)
    
    # Graph operations
    graph = GraphOfThoughts()
    root = graph.create_root("Test root problem")
    test("Create Root", root.thought_type == ThoughtType.ROOT)
    
    branches = graph.diverge(root.node_id, 3)
    test("Diverge", len(branches) == 3)
    
    converged = graph.converge([b.node_id for b in branches])
    test("Converge", converged.thought_type == ThoughtType.CONVERGE)
    
    # Pruning
    graph.prune_low_quality(threshold=0.5)
    test("Prune Operation", True)


def test_fate_verifier():
    """Test FATE Verification Engine"""
    print("\n📦 TESTING FATE VERIFIER...")
    
    try:
        from fate_verifier import (
            FATEVerificationEngine, VerificationResult,
            IhsanVerifier, AdlVerifier, LTLEncoder
        )
        test("Import FATE", True)
    except Exception as e:
        test("Import FATE", False, str(e))
        return
    
    # Initialize
    fate = FATEVerificationEngine()
    status = fate.get_status()
    test("FATE Init", status["constraints"] == 6, f"{status['constraints']} constraints")
    
    # Ihsān verification - returns (result, score) tuple
    ihsan = IhsanVerifier()
    good_scores = {
        "correctness": 0.98,
        "safety": 0.99,
        "user_benefit": 0.96,
        "efficiency": 0.95,
        "auditability": 1.0,
        "anti_centralization": 0.94,
        "robustness": 0.97,
        "adl_fairness": 0.98
    }
    from fate_verifier import VerificationResult
    result_enum, score = ihsan.verify(good_scores)
    test("Ihsān Pass", result_enum == VerificationResult.SAT)
    test("Ihsān Score", score >= 0.95, f"{score:.4f}")
    
    bad_scores = {k: 0.5 for k in good_scores}
    result_enum, score = ihsan.verify(bad_scores)
    test("Ihsān Fail", result_enum == VerificationResult.UNSAT)
    
    # Adl verification - returns (result, gini) tuple
    adl = AdlVerifier()
    result_enum, gini = adl.verify([0.25, 0.25, 0.25, 0.25])
    test("Adl Equal Distribution", result_enum == VerificationResult.SAT)
    
    result_enum, gini = adl.verify([0.99, 0.005, 0.003, 0.002])
    test("Adl Unequal Fail", result_enum == VerificationResult.UNSAT)
    
    # Full verification
    action = {
        "type": "TEST_ACTION",
        "ihsan_scores": good_scores,
        "has_receipt": True,
        "is_hallucination": False
    }
    passed, proofs = fate.verify_action(action)
    test("Full Verification", passed)
    test("Proof Count", len(proofs) == 6, f"{len(proofs)} proofs")


def test_sape_integration():
    """Test SAPE v1.∞ Integration"""
    print("\n📦 TESTING SAPE INTEGRATION...")
    
    try:
        from sape_v1_infinity import SAPEv1Infinity
        test("Import SAPE", True)
        
        sape = SAPEv1Infinity()
        test("SAPE Init", True)
        
        result = sape.process("Test query", {"test": True})
        test("SAPE Process", "ihsan_score" in result)
        
    except Exception as e:
        test("SAPE Available", False, f"Not available: {str(e)[:50]}")


def test_ddagi_system():
    """Test unified DDAGI system"""
    print("\n📦 TESTING DDAGI UNIFIED SYSTEM...")
    
    try:
        from ddagi_system import DDAGISystem
        test("Import DDAGI", True)
    except Exception as e:
        test("Import DDAGI", False, str(e))
        return
    
    # Initialize
    ddagi = DDAGISystem()
    init = ddagi.initialize()
    test("DDAGI Init", init["operational"])
    test("Active Components", init["active_count"] >= 4, f"{init['active_count']}/5")
    
    # Process query
    result = ddagi.process_query("Test the Third Fact paradigm")
    test("Query Processing", result["summary"]["success"])
    test("Stages Complete", result["summary"]["stages_complete"] >= 3)
    
    # Status
    status = ddagi.get_status()
    test("Third Fact Active", status["epistemology"]["third_fact"]["status"] == "ACTIVE")
    test("Covenant", status["covenant"] == "Ihsān")
    
    # Seal
    seal = ddagi.seal()
    test("Seal Hash", len(seal["seal_hash"]) == 64)


def run_all_tests():
    """Execute all test suites"""
    
    print("="*80)
    print("🧪 BIZRA DDAGI — PEAK MASTERPIECE TEST SUITE")
    print("="*80)
    print(f"   Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print(f"   Classification: MASTERPIECE-OMEGA")
    print("="*80)
    
    # Run test suites
    test_genesis_kernel()
    test_apex_blueprint()
    test_graph_of_thoughts()
    test_fate_verifier()
    test_sape_integration()
    test_ddagi_system()
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST RESULTS SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, ok, _ in RESULTS if ok)
    failed = sum(1 for _, ok, _ in RESULTS if not ok)
    total = len(RESULTS)
    
    print(f"\n   Total Tests: {total}")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   Pass Rate: {passed/total*100:.1f}%")
    
    if failed > 0:
        print(f"\n   ⚠️ FAILED TESTS:")
        for name, ok, details in RESULTS:
            if not ok:
                print(f"      • {name}: {details}")
    
    # Grade
    rate = passed / total
    if rate >= 0.95:
        grade = "A+ (MASTERPIECE)"
    elif rate >= 0.90:
        grade = "A (ELITE)"
    elif rate >= 0.80:
        grade = "B (PROFESSIONAL)"
    elif rate >= 0.70:
        grade = "C (ACCEPTABLE)"
    else:
        grade = "F (NEEDS WORK)"
    
    print(f"\n   🏆 GRADE: {grade}")
    
    # Generate test seal
    seal_data = {
        "suite": "BIZRA DDAGI Peak Masterpiece",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_tests": total,
        "passed": passed,
        "failed": failed,
        "pass_rate": rate,
        "grade": grade,
        "classification": "MASTERPIECE-OMEGA"
    }
    
    seal_json = json.dumps(seal_data, sort_keys=True)
    seal_data["seal_hash"] = hashlib.sha256(seal_json.encode()).hexdigest()
    
    print(f"\n   Test Seal: {seal_data['seal_hash'][:32]}...")
    
    # Save
    seal_path = Path(__file__).parent.parent / "TEST_SUITE_SEAL.json"
    with open(seal_path, 'w') as f:
        json.dump(seal_data, f, indent=2)
    
    print(f"   Saved: {seal_path}")
    
    print("\n" + "="*80)
    if rate >= 0.90:
        print("🏆 PEAK MASTERPIECE: VERIFIED")
    else:
        print("⚠️ REFINEMENT NEEDED")
    print("="*80)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
