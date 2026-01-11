"""
BIZRA SystemProtocolKernel v2.0
================================
The Ethical Microkernel — Layer 3.5 of the APEX Architecture

This kernel sits between Layer 3 (Execution) and Layer 4 (Cognitive),
enforcing Ihsān thresholds, protocol hashing, and SAPE elevation.

Components:
- IhsanVector: 8-dimensional ethical scoring
- SessionManager: Protocol-hashed session tracking
- MultiStageVerifier: 9-probe verification protocol
- SNRTracker: Signal-to-noise optimization
- SAPEEngine: Symbolic pattern elevation
"""

from .ihsan_vector import IhsanVector, IhsanDimension, IHSAN_THRESHOLD
from .session_manager import SessionManager, Session
from .verifier import MultiStageVerifier, VerificationResult
from .snr_tracker import SNRTracker, SNRMetrics
from .sape_engine import SAPEEngine, ElevatedPattern
from .kernel import SystemProtocolKernel, get_kernel
from .synapse_frame import SynapseFrame, SynapseVerification, verify_synapse_frame
from .llm_bridge import LLMBridge, BridgeConfig, BridgeResult
from .replay_guard import ReplayGuard, Envelope

__version__ = "2.0.0"
__all__ = [
    "IhsanVector",
    "IhsanDimension",
    "IHSAN_THRESHOLD",
    "SessionManager",
    "Session",
    "MultiStageVerifier",
    "VerificationResult",
    "SNRTracker",
    "SNRMetrics",
    "SAPEEngine",
    "ElevatedPattern",
    "SystemProtocolKernel",
    "SynapseFrame",
    "SynapseVerification",
    "verify_synapse_frame",
    "LLMBridge",
    "BridgeConfig",
    "BridgeResult",
    "ReplayGuard",
    "Envelope",
    "get_kernel",
]
