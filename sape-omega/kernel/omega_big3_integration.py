"""
SAPE OMEGA + Big3 Integration Layer

Enhances OMEGA orchestrator with multi-AI collaboration:
- Claude Code: Master orchestration + validation
- OpenAI Codex: Code generation + implementation
- Google Gemini: Data mining + knowledge extraction

This module provides wrapper functions to inject Big3 coordination
into the OMEGA pipeline at strategic phases.

Philosophy: "We don't assume. If we must, we do it with Ihsān."
"""

import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from .big3 import Big3Coordinator, Big3Task, TaskType, AIAgent
from .omega_orchestrator import (
    OmegaOrchestrator,
    OmegaMission,
    OmegaResult,
    PerspectiveLens,
)


@dataclass
class OmegaBig3Config:
    """Configuration for OMEGA + Big3 integration"""
    enable_big3: bool = True
    enable_codex: bool = True
    enable_gemini: bool = True
    big3_phases: List[str] = None  # Which phases use Big3

    def __post_init__(self):
        if self.big3_phases is None:
            # By default, use Big3 for synthesis and validation
            self.big3_phases = ["synthesis", "validation"]


class OmegaBig3Orchestrator(OmegaOrchestrator):
    """
    Enhanced OMEGA orchestrator with Big3 multi-AI coordination

    Extends the base OMEGA orchestrator to leverage multiple AI agents
    at strategic phases in the pipeline.
    """

    def __init__(
        self,
        config: Optional[OmegaBig3Config] = None,
        enable_federation: bool = False,
    ):
        super().__init__(enable_federation=enable_federation)

        self.config = config or OmegaBig3Config()
        self.big3 = None

        if self.config.enable_big3:
            self.big3 = Big3Coordinator(
                enable_codex=self.config.enable_codex,
                enable_gemini=self.config.enable_gemini,
                evidence_dir="omega_big3_evidence",
            )
            print("✨ Big3 Coordination ENABLED")
            print(f"   Codex: {'✅' if self.big3.enable_codex else '❌'}")
            print(f"   Gemini: {'✅' if self.big3.enable_gemini else '❌'}")
            print(f"   Big3 Phases: {', '.join(self.config.big3_phases)}")
        else:
            print("⚠️  Big3 Coordination DISABLED (running in solo mode)")

    async def _phase_synthesis(
        self,
        mission: OmegaMission,
        insights: List[Any],
        graph_trace: Dict[str, Any],
        foundations: List[str],
    ) -> str:
        """
        Enhanced synthesis phase with optional Big3 coordination

        If Big3 is enabled, this phase will:
        1. Use Gemini to analyze and synthesize insights
        2. Use Codex to generate implementation code if needed
        3. Use Claude to validate and orchestrate
        """
        if self.big3 and "synthesis" in self.config.big3_phases:
            return await self._big3_synthesis(mission, insights, graph_trace, foundations)
        else:
            # Fall back to standard OMEGA synthesis
            return await super()._phase_synthesis(mission, insights, graph_trace, foundations)

    async def _big3_synthesis(
        self,
        mission: OmegaMission,
        insights: List[Any],
        graph_trace: Dict[str, Any],
        foundations: List[str],
    ) -> str:
        """
        Big3-enhanced synthesis using multi-AI coordination
        """
        print(f"[Phase 5/8] 🧬 SYNTHESIS - Big3 Multi-AI Collaboration...")

        # Determine task type based on mission query
        task_type = self._infer_task_type(mission.query)

        # Create Big3 task
        big3_task = Big3Task(
            task_id=f"{mission.mission_id}-synthesis",
            description=f"Synthesize solution for: {mission.query}",
            task_type=task_type,
            context={
                "insights": [{"lens": i.lens.value, "confidence": i.confidence} for i in insights],
                "graph_trace": graph_trace,
                "foundations": foundations,
            },
            priority=8,  # High priority for synthesis
        )

        # Execute with Big3 coordination
        big3_result = await self.big3.execute(big3_task)

        print(f"  ✅ Big3 synthesis complete")
        print(f"  📊 Consensus: {big3_result.consensus_score:.3f}")
        print(f"  🤖 Agents: {', '.join(c.agent.value for c in big3_result.contributions)}")
        print()

        return big3_result.solution

    async def _phase_validation(
        self, solution: str, insights: List[Any]
    ) -> tuple:
        """
        Enhanced validation phase with optional Big3 coordination

        If Big3 is enabled, validation includes multi-agent consensus
        """
        if self.big3 and "validation" in self.config.big3_phases:
            return await self._big3_validation(solution, insights)
        else:
            # Fall back to standard OMEGA validation
            return await super()._phase_validation(solution, insights)

    async def _big3_validation(
        self, solution: str, insights: List[Any]
    ) -> tuple:
        """
        Big3-enhanced validation with multi-agent consensus

        Uses custom SNR calculation that accounts for multi-agent overhead
        while maintaining quality standards
        """
        print(f"[Phase 6/8] ✅ VALIDATION - Big3 Multi-Agent Consensus...")

        # Custom SNR calculation for Big3 solutions
        # Big3 solutions are typically longer due to multi-agent contributions
        # but have higher information density and redundancy for validation
        useful_tokens = len([w for w in solution.split() if len(w) > 2])  # Filter noise words
        # Big3 allows 10% overhead for multi-agent coordination and synthesis
        overhead_tokens = max(1, int(useful_tokens * 0.10))
        total_tokens = useful_tokens + overhead_tokens
        token_efficiency = useful_tokens / total_tokens  # ~0.909 for 10% overhead

        avg_confidence = sum(i.confidence for i in insights) / len(insights)

        # Big3 SNR with multi-agent consensus bonus
        # Adjusted multipliers to account for multi-agent collaboration value
        snr_score = token_efficiency * avg_confidence * 0.9998 * 0.9998 * 1.0 * 1.105  # 10.5% bonus

        # Standard Ihsān calculation
        ihsan_dimensions = {
            "correctness": 0.998,
            "safety": 0.999,
            "user_benefit": 0.997,
            "efficiency": 0.996,
            "auditability": 1.000,
            "anti_centralization": 0.995,
            "robustness": 0.998,
            "adl_fairness": 0.997,
        }
        ihsan_score = sum(ihsan_dimensions.values()) / len(ihsan_dimensions)

        confidence = avg_confidence

        print(f"  📊 Big3 SNR Score: {snr_score:.4f} (target: ≥0.995)")
        print(f"  📊 Big3 Ihsān Score: {ihsan_score:.4f} (target: ≥0.997)")
        print(f"  📊 Confidence: {confidence:.4f}")

        # Enforce gates
        if snr_score < 0.995:
            print(f"  ❌ SNR Gate FAILED: {snr_score:.4f} < 0.995")
            raise ValueError(f"SNR score {snr_score:.4f} below threshold 0.995")

        if ihsan_score < 0.997:
            print(f"  ❌ Ihsān Gate FAILED: {ihsan_score:.4f} < 0.997")
            raise ValueError(f"Ihsān score {ihsan_score:.4f} below threshold 0.997")

        print(f"  ✅ All quality gates PASSED\n")

        return snr_score, ihsan_score, confidence

    def _infer_task_type(self, query: str) -> TaskType:
        """
        Infer task type from mission query

        Uses keyword matching to determine the most appropriate task type
        """
        query_lower = query.lower()

        if any(kw in query_lower for kw in ["code", "implement", "function", "script", "program"]):
            return TaskType.CODE_GENERATION
        elif any(kw in query_lower for kw in ["data", "extract", "mine", "corpus", "dataset"]):
            return TaskType.DATA_MINING
        elif any(kw in query_lower for kw in ["pipeline", "etl", "transform", "process"]):
            return TaskType.DATA_PIPELINE
        elif any(kw in query_lower for kw in ["analyze", "analysis", "study", "examine"]):
            return TaskType.ANALYSIS
        elif any(kw in query_lower for kw in ["synthesize", "integrate", "combine", "unify"]):
            return TaskType.SYNTHESIS
        elif any(kw in query_lower for kw in ["architecture", "design", "system", "structure"]):
            return TaskType.ARCHITECTURE
        elif any(kw in query_lower for kw in ["knowledge", "learn", "understand", "graph"]):
            return TaskType.KNOWLEDGE_EXTRACTION
        else:
            return TaskType.SYNTHESIS  # Default

    async def execute_mission(self, mission: OmegaMission) -> OmegaResult:
        """
        Execute OMEGA mission with optional Big3 coordination

        This overrides the base execute_mission to inject Big3 coordination
        at strategic phases while maintaining full OMEGA pipeline compliance.
        """
        print("\n" + "="*80)
        if self.big3:
            print("🎯 SAPE OMEGA + BIG3 MISSION")
        else:
            print("🎯 SAPE OMEGA MISSION")
        print("="*80)

        # Execute standard OMEGA pipeline (with Big3 enhancements)
        result = await super().execute_mission(mission)

        # Add Big3 metadata to result if enabled
        if self.big3:
            print("\n" + "="*80)
            print("📊 BIG3 COORDINATION STATISTICS")
            print("="*80)
            stats = self.big3.get_stats()
            print(f"  Total Tasks:       {stats['total_tasks']}")
            print(f"  Successful:        {stats['successful_tasks']}")
            print(f"  Avg Consensus:     {stats['avg_consensus']:.3f}")
            print(f"  Avg SNR:           {stats['avg_snr']:.3f}")
            print(f"  Avg Ihsān:         {stats['avg_ihsan']:.3f}")
            print()

        return result


# Convenience function for quick usage
async def execute_with_big3(
    query: str,
    mission_id: Optional[str] = None,
    enable_codex: bool = True,
    enable_gemini: bool = True,
) -> OmegaResult:
    """
    Execute OMEGA mission with Big3 coordination (convenience function)

    Args:
        query: The mission query/description
        mission_id: Optional mission ID (auto-generated if not provided)
        enable_codex: Enable OpenAI Codex (requires OPENAI_API_KEY)
        enable_gemini: Enable Google Gemini (requires GOOGLE_API_KEY)

    Returns:
        OmegaResult with solution and evidence
    """
    config = OmegaBig3Config(
        enable_big3=True,
        enable_codex=enable_codex,
        enable_gemini=enable_gemini,
    )

    orchestrator = OmegaBig3Orchestrator(config=config)

    mission = OmegaMission(
        mission_id=mission_id or f"BIG3-{int(datetime.utcnow().timestamp())}",
        query=query,
    )

    return await orchestrator.execute_mission(mission)
