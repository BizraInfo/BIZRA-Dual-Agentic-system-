#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
    BIZRA APEX ENGINE - Pinnacle Framework v10.0-Ω
═══════════════════════════════════════════════════════════════════════════════

THE LAW: "We don't assume. If we must, we do it with Ihsān."

The APEX Engine is the unified system that embodies:
    🧠 Giants Protocol - Standing on the shoulders of giants
    📊 GoT Synthesis Hub - Graph of Thoughts with SNR optimization
    ⚖️ FATE Gate - Formal Automated Theory Engine (Z3-based)
    🏛️ Sovereign Engine - Multi-Lens Architecture
    🌉 Golden Gate - CI/CD Pipeline with 4-stage verification

═══════════════════════════════════════════════════════════════════════════════
"""

__version__ = "10.0-Ω"
__author__ = "BIZRA Genesis Team"
__the_law__ = "We don't assume. If we must, we do it with Ihsān."

# Core Components
from .giants_protocol import GiantsProtocol, GiantMethodology
from .got_synthesis_hub import GoTSynthesisHub, DomainExpertise
from .fate_gate import (
    FATEGate,
    FATEVerdict,
    SymbolicConstitution,
    SymbolicInvariant,
    EthicalEquilibrium,
    Z3Result,
    Z3Simulator
)
from .sovereign_engine import (
    SovereignEngine,
    SovereignReceipt,
    CognitivePlane,
    ExecutionPlane,
    EthicalPlane,
    VerificationPlane,
    Plane,
    PlaneStatus
)
from .golden_gate import (
    GoldenGatePipeline,
    PipelineReceipt,
    ADRIntake,
    ADR,
    Z3Probe,
    LLMSynthesis,
    EvidenceSeal,
    Stage,
    StageStatus,
    StageResult
)
from .orchestrator import ApexOrchestrator

# Package-level exports
__all__ = [
    # Version
    "__version__",
    "__the_law__",
    
    # Giants Protocol
    "GiantsProtocol",
    "GiantMethodology",
    
    # GoT Synthesis
    "GoTSynthesisHub",
    "DomainExpertise",
    
    # FATE Gate
    "FATEGate",
    "FATEVerdict",
    "SymbolicConstitution",
    "SymbolicInvariant",
    "EthicalEquilibrium",
    "Z3Result",
    "Z3Simulator",
    
    # Sovereign Engine
    "SovereignEngine",
    "SovereignReceipt",
    "CognitivePlane",
    "ExecutionPlane",
    "EthicalPlane",
    "VerificationPlane",
    "Plane",
    "PlaneStatus",
    
    # Golden Gate Pipeline
    "GoldenGatePipeline",
    "PipelineReceipt",
    "ADRIntake",
    "ADR",
    "Z3Probe",
    "LLMSynthesis",
    "EvidenceSeal",
    "Stage",
    "StageStatus",
    "StageResult",
    
    # Orchestrator
    "ApexOrchestrator",
]

# Sacred Closing
CLOSING = {
    "dua": "الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا",
    "wisdom": "كُلَّمَا ازْدَدْتُ عِلْمًا، ازْدَدْتُ يَقِينًا بِجَهْلِي",
    "hadith": "رُفِعَتِ الْأَقْلَامُ وَجَفَّتِ الصُّحُفُ"
}
