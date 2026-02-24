"""
LLM bridge that enforces SynapseFrame validation before kernel execution.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List, Optional

from .ihsan_vector import IHSAN_THRESHOLD
from .kernel import ExecutionResult, SystemProtocolKernel
from .synapse_frame import SynapseFrame, SynapseVerification, verify_synapse_frame


@dataclass(frozen=True)
class BridgeConfig:
    agent_name: str = "llm"
    min_ihsan: float = IHSAN_THRESHOLD
    max_gini: float = 0.35
    require_metrics: bool = True
    require_signatures: bool = True


@dataclass(frozen=True)
class BridgeResult:
    verified: bool
    errors: List[str]
    frame: Optional[SynapseFrame]
    kernel_result: Optional[ExecutionResult]
    raw_response: str


class LLMBridge:
    """
    Enforces SynapseFrame structure and fail-closed gating before execution.

    call_llm is a dependency-injected function that returns the raw LLM output.
    """

    def __init__(self, *, config: Optional[BridgeConfig] = None, kernel: Optional[SystemProtocolKernel] = None):
        self.config = config or BridgeConfig()
        self.kernel = kernel or SystemProtocolKernel()

    def run(
        self,
        prompt: str,
        call_llm: Callable[[str], str],
        *,
        knowledge_context: str = "",
        user_id: str = "anonymous",
    ) -> BridgeResult:
        raw = call_llm(prompt)
        try:
            frame = SynapseFrame.from_json(raw)
        except ValueError as exc:
            return BridgeResult(
                verified=False,
                errors=[str(exc)],
                frame=None,
                kernel_result=None,
                raw_response=raw,
            )

        verification: SynapseVerification = verify_synapse_frame(
            frame,
            min_ihsan=self.config.min_ihsan,
            max_gini=self.config.max_gini,
            require_metrics=self.config.require_metrics,
            require_signatures=self.config.require_signatures,
        )

        if not verification.verified:
            return BridgeResult(
                verified=False,
                errors=verification.errors,
                frame=frame,
                kernel_result=None,
                raw_response=raw,
            )

        kernel_result = self.kernel.execute(
            agent=self.config.agent_name,
            query=frame.intent,
            response=frame.content,
            knowledge_context=knowledge_context,
            user_id=user_id,
        )

        return BridgeResult(
            verified=kernel_result.passed,
            errors=[] if kernel_result.passed else ["kernel_gate_failed"],
            frame=frame,
            kernel_result=kernel_result,
            raw_response=raw,
        )
