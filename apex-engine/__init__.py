"""
BIZRA Apex Engine - Unified Orchestration System
═══════════════════════════════════════════════════════════════════════════════

THE LAW: "We don't assume. If we must, we do it with Ihsān."

Components:
    - Giants Protocol: 7-methodology interdisciplinary synthesis
    - GoT Synthesis Hub: Graph of Thoughts parallel ideation
    - Apex Orchestrator: Unified production orchestration
    - CLI Interface: Command-line operations
    - REST API: Production API gateway

حديث ابن عباس رضي الله عنهما:
«يَا غُلَامُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ»

═══════════════════════════════════════════════════════════════════════════════
"""

__version__ = "7.1.0"
__codename__ = "APEX_MASTERPIECE"
__law__ = "We don't assume. If we must, we do it with Ihsān."

from .giants_protocol import GiantsProtocol, GiantMethodology, IhsanConstitution
from .got_synthesis_hub import GoTSynthesisHub, DomainExpertise

__all__ = [
    "GiantsProtocol",
    "GiantMethodology", 
    "IhsanConstitution",
    "GoTSynthesisHub",
    "DomainExpertise",
    "__version__",
    "__codename__",
    "__law__",
]
