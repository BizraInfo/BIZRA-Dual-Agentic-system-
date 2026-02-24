#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║           ECOSYSTEM COHERENCE VALIDATOR — NODE0 SOVEREIGNTY ENGINE           ║
# ║                    SAPE v1.∞ | Ihsan Constitutional Governance               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# This module implements the Active Ecosystem Coherence Validator, which transmutes
# static identity markers (NODE0_IDENTITY.yaml) into a living, self-auditing
# sovereignty fabric. It validates that all constituent components of the Node0
# Genesis Block maintain prescriptive alignment with the canonical registry.
#
# Architectural Taxonomy:
#   - Graph of Thoughts: Multi-dimensional validation topology
#   - SNR Maximization: Signal extraction from heterogeneous component states
#   - Standing on Shoulders of Giants: Derives authority from Ihsan Constitution
#
# "The coefficient of unification must remain at 1.0"

from __future__ import annotations

import hashlib
import json
import logging
import os
import platform
import socket
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAXONOMIC DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CoherenceState(Enum):
    """Taxonomic classification of ecosystem coherence states."""
    UNIFIED = "unified"           # All components aligned, coefficient = 1.0
    DEGRADED = "degraded"         # Partial alignment, remediation required
    FRAGMENTED = "fragmented"     # Critical misalignment detected
    UNKNOWN = "unknown"           # Insufficient data for determination


class ComponentRole(Enum):
    """Prescriptive role allocations within the Node0 ecosystem."""
    KERNEL = "kernel"             # Canonical source, orchestration authority
    NODE = "node"                 # Interface layer, user experience
    VAULT = "vault"               # Persistent memory, data lake
    SCAFFOLD = "scaffold"         # Documentation, specifications
    TASKMASTER = "taskmaster"     # Project management, archives
    OS = "os"                     # System layer, platform integration


@dataclass
class ComponentValidation:
    """Encapsulates validation results for a single ecosystem component."""
    role: ComponentRole
    path: Path
    accessible: bool
    identity_present: bool
    identity_valid: bool
    canonical_alignment: float  # Coefficient [0.0, 1.0]
    encumbrances: List[str] = field(default_factory=list)
    diagnostics: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def coherence_score(self) -> float:
        """Compute weighted coherence coefficient for this component."""
        if not self.accessible:
            return 0.0
        base_score = 0.4 if self.accessible else 0.0
        identity_score = 0.3 if self.identity_present else 0.0
        validity_score = 0.3 * self.canonical_alignment if self.identity_valid else 0.0
        return base_score + identity_score + validity_score


@dataclass
class EcosystemCoherenceReport:
    """Comprehensive coherence assessment of the Node0 Genesis Block."""
    timestamp: datetime
    hostname: str
    network_identity: str
    state: CoherenceState
    unification_coefficient: float
    component_validations: List[ComponentValidation]
    hardware_substrate: Dict[str, Any]
    software_layers: Dict[str, Any]
    ihsan_score: float
    encumbrances: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize report to dictionary for JSON/YAML emission."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "hostname": self.hostname,
            "network_identity": self.network_identity,
            "state": self.state.value,
            "unification_coefficient": round(self.unification_coefficient, 4),
            "ihsan_score": round(self.ihsan_score, 4),
            "components": [
                {
                    "role": cv.role.value,
                    "path": str(cv.path),
                    "accessible": cv.accessible,
                    "identity_present": cv.identity_present,
                    "identity_valid": cv.identity_valid,
                    "canonical_alignment": round(cv.canonical_alignment, 4),
                    "coherence_score": round(cv.coherence_score, 4),
                    "encumbrances": cv.encumbrances,
                }
                for cv in self.component_validations
            ],
            "hardware_substrate": self.hardware_substrate,
            "software_layers": self.software_layers,
            "encumbrances": self.encumbrances,
            "recommendations": self.recommendations,
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NODE0 COMPONENT REGISTRY (Canonical Configuration)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NODE0_COMPONENTS: Dict[ComponentRole, Dict[str, Any]] = {
    ComponentRole.KERNEL: {
        "wsl_path": Path("/root/bizra-genesis"),
        "windows_path": Path(r"\\wsl$\Ubuntu\root\bizra-genesis"),
        "repository": "https://github.com/BizraInfo/BIZRA-Dual-Agentic-system-.git",
        "weight": 0.30,  # Highest weight: canonical source
    },
    ComponentRole.NODE: {
        "wsl_path": Path("/mnt/c/BIZRA-Dual-Agentic-system--main"),
        "windows_path": Path(r"C:\BIZRA-Dual-Agentic-system--main"),
        "repository": "https://github.com/BizraInfo/bizra-genesis-node.git",
        "weight": 0.20,
    },
    ComponentRole.VAULT: {
        "wsl_path": Path("/mnt/c/BIZRA-DATA-LAKE"),
        "windows_path": Path(r"C:\BIZRA-DATA-LAKE"),
        "repository": None,  # Data lake, not version controlled
        "weight": 0.15,
    },
    ComponentRole.SCAFFOLD: {
        "wsl_path": Path("/mnt/c/bizra_scaffold"),
        "windows_path": Path(r"C:\bizra_scaffold"),
        "repository": "https://github.com/BizraInfo/bizra_scaffold.git",
        "weight": 0.15,
    },
    ComponentRole.TASKMASTER: {
        "wsl_path": Path("/mnt/c/BIZRA-TaskMaster"),
        "windows_path": Path(r"C:\BIZRA-TaskMaster"),
        "repository": "https://github.com/BizraInfo/BIZRA-TaskMaster.git",
        "weight": 0.10,
    },
    ComponentRole.OS: {
        "wsl_path": Path("/mnt/c/BIZRA-OS"),
        "windows_path": Path(r"C:\BIZRA-OS"),
        "repository": "https://github.com/BizraInfo/BIZRA-OS.git",
        "weight": 0.10,
    },
}

CANONICAL_REGISTRY_PATH = Path("/root/bizra-genesis/NODE0_REGISTRY.yaml")
IDENTITY_FILENAME = "NODE0_IDENTITY.yaml"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ECOSYSTEM COHERENCE VALIDATOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class EcosystemCoherenceValidator:
    """
    Active Ecosystem Coherence Validator for Node0 Genesis Block.
    
    This validator implements the Standing on Shoulders of Giants protocol,
    deriving its authority from the Ihsan Constitution and the canonical
    NODE0_REGISTRY.yaml. It performs multi-dimensional validation across
    all constituent components, computing the unification coefficient and
    identifying any encumbrances that threaten ecosystem coherence.
    
    Graph of Thoughts Architecture:
        ┌─────────────────────────────────────────────────────────────────┐
        │                      COHERENCE VALIDATOR                        │
        │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐         │
        │  │ Hardware│──▶│Software │──▶│  Data   │──▶│ Network │         │
        │  │Substrate│   │ Layers  │   │  Space  │   │ Identity│         │
        │  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘         │
        │       │             │             │             │               │
        │       └─────────────┴─────────────┴─────────────┘               │
        │                         │                                       │
        │                         ▼                                       │
        │              ┌─────────────────────┐                           │
        │              │ Unification Coeff.  │                           │
        │              │   (Target: 1.0)     │                           │
        │              └─────────────────────┘                           │
        └─────────────────────────────────────────────────────────────────┘
    """
    
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger(__name__)
        self._canonical_registry: Optional[Dict[str, Any]] = None
        self._is_wsl = self._detect_wsl_environment()
        
    def _detect_wsl_environment(self) -> bool:
        """Determine whether execution context is WSL or native Windows."""
        if platform.system() == "Linux":
            try:
                with open("/proc/version", "r") as f:
                    return "microsoft" in f.read().lower()
            except Exception:
                pass
        return False
    
    def _get_component_path(self, role: ComponentRole) -> Path:
        """Resolve appropriate path based on execution environment."""
        config = NODE0_COMPONENTS[role]
        if self._is_wsl or platform.system() == "Linux":
            return config["wsl_path"]
        return config["windows_path"]
    
    def _load_canonical_registry(self) -> Dict[str, Any]:
        """Load the canonical NODE0_REGISTRY.yaml from the kernel."""
        if self._canonical_registry is not None:
            return self._canonical_registry
            
        if not YAML_AVAILABLE:
            self.logger.warning("PyYAML not available; registry validation degraded")
            return {}
            
        try:
            with open(CANONICAL_REGISTRY_PATH, "r", encoding="utf-8") as f:
                self._canonical_registry = yaml.safe_load(f)
                return self._canonical_registry
        except Exception as e:
            self.logger.error(f"Failed to load canonical registry: {e}")
            return {}
    
    def _validate_identity_file(
        self, 
        identity_path: Path,
        role: ComponentRole
    ) -> Tuple[bool, float, List[str]]:
        """
        Validate NODE0_IDENTITY.yaml against canonical expectations.
        
        Returns:
            Tuple of (is_valid, alignment_coefficient, encumbrances)
        """
        encumbrances = []
        
        if not identity_path.exists():
            return False, 0.0, ["Identity marker absent"]
        
        if not YAML_AVAILABLE:
            # Degraded validation: file exists but cannot parse
            return True, 0.5, ["YAML parsing unavailable; validation degraded"]
        
        try:
            with open(identity_path, "r", encoding="utf-8") as f:
                identity = yaml.safe_load(f)
        except Exception as e:
            return False, 0.0, [f"Identity file malformed: {e}"]
        
        # Validate required fields
        alignment = 1.0
        
        if "node0" not in identity:
            encumbrances.append("Missing 'node0' root key")
            alignment -= 0.3
        else:
            node0 = identity["node0"]
            if not node0.get("genesis_block"):
                encumbrances.append("genesis_block flag not set")
                alignment -= 0.2
            if node0.get("hostname") != "MSI":
                encumbrances.append(f"Hostname mismatch: expected 'MSI'")
                alignment -= 0.1
        
        if "component" not in identity:
            encumbrances.append("Missing 'component' specification")
            alignment -= 0.2
        else:
            component = identity["component"]
            expected_role = role.value.upper()
            actual_role = component.get("role", "").upper()
            if expected_role not in actual_role and actual_role not in expected_role:
                encumbrances.append(f"Role mismatch: expected '{role.value}'")
                alignment -= 0.2
        
        return len(encumbrances) == 0, max(0.0, alignment), encumbrances
    
    def _validate_component(self, role: ComponentRole) -> ComponentValidation:
        """Perform comprehensive validation of a single ecosystem component."""
        path = self._get_component_path(role)
        encumbrances = []
        diagnostics = {}
        
        # Accessibility check
        accessible = path.exists() and path.is_dir()
        if not accessible:
            return ComponentValidation(
                role=role,
                path=path,
                accessible=False,
                identity_present=False,
                identity_valid=False,
                canonical_alignment=0.0,
                encumbrances=[f"Path inaccessible: {path}"],
            )
        
        # Identity marker check
        identity_path = path / IDENTITY_FILENAME
        identity_present = identity_path.exists()
        
        if identity_present:
            identity_valid, alignment, id_encumbrances = self._validate_identity_file(
                identity_path, role
            )
            encumbrances.extend(id_encumbrances)
        else:
            identity_valid = False
            alignment = 0.0
            encumbrances.append("NODE0_IDENTITY.yaml not found")
        
        # Git repository status (if applicable)
        config = NODE0_COMPONENTS[role]
        if config.get("repository"):
            git_dir = path / ".git"
            if git_dir.exists():
                diagnostics["git_initialized"] = True
                try:
                    result = subprocess.run(
                        ["git", "-C", str(path), "rev-parse", "--short", "HEAD"],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        diagnostics["git_head"] = result.stdout.strip()
                except Exception:
                    pass
            else:
                diagnostics["git_initialized"] = False
                encumbrances.append("Expected git repository not initialized")
        
        return ComponentValidation(
            role=role,
            path=path,
            accessible=accessible,
            identity_present=identity_present,
            identity_valid=identity_valid,
            canonical_alignment=alignment,
            encumbrances=encumbrances,
            diagnostics=diagnostics,
        )
    
    def _gather_hardware_substrate(self) -> Dict[str, Any]:
        """Collect hardware substrate telemetry."""
        substrate = {
            "hostname": socket.gethostname(),
            "platform": platform.system(),
            "architecture": platform.machine(),
        }
        
        if PSUTIL_AVAILABLE:
            try:
                substrate["cpu_count"] = psutil.cpu_count()
                mem = psutil.virtual_memory()
                substrate["memory_total_gb"] = round(mem.total / (1024**3), 2)
                substrate["memory_available_gb"] = round(mem.available / (1024**3), 2)
                
                disk = psutil.disk_usage("/")
                substrate["disk_total_gb"] = round(disk.total / (1024**3), 2)
                substrate["disk_used_percent"] = disk.percent
            except Exception as e:
                substrate["psutil_error"] = str(e)
        
        return substrate
    
    def _gather_software_layers(self) -> Dict[str, Any]:
        """Collect software layer telemetry."""
        layers = {
            "python_version": platform.python_version(),
            "execution_context": "wsl" if self._is_wsl else platform.system().lower(),
        }
        
        # Check Docker availability
        try:
            result = subprocess.run(
                ["docker", "info", "--format", "{{.ServerVersion}}"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                layers["docker_version"] = result.stdout.strip()
        except Exception:
            layers["docker_version"] = None
        
        return layers
    
    def _compute_ihsan_score(
        self, 
        validations: List[ComponentValidation]
    ) -> float:
        """
        Compute Ihsan constitutional score for ecosystem coherence.
        
        Weighted dimensions:
            - correctness (0.22): All identities correctly formed
            - safety (0.22): No security encumbrances
            - auditability (0.12): All components traceable
            - anti_centralization (0.08): Distributed topology maintained
            - robustness (0.06): Resilient to component failures
        """
        accessible_ratio = sum(1 for v in validations if v.accessible) / len(validations)
        identity_ratio = sum(1 for v in validations if v.identity_valid) / len(validations)
        alignment_avg = sum(v.canonical_alignment for v in validations) / len(validations)
        
        # Ihsan dimensional scoring
        correctness = identity_ratio  # All identities correctly formed
        safety = 1.0 if all(len(v.encumbrances) == 0 for v in validations) else 0.7
        auditability = accessible_ratio  # All components traceable
        anti_centralization = 1.0  # Single node, but distributed components
        robustness = min(1.0, accessible_ratio + 0.2)  # Degraded if components missing
        
        ihsan = (
            0.22 * correctness +
            0.22 * safety +
            0.12 * auditability +
            0.08 * anti_centralization +
            0.06 * robustness +
            0.30 * alignment_avg  # Remaining weight to alignment
        )
        
        return min(1.0, ihsan)
    
    def _generate_recommendations(
        self,
        validations: List[ComponentValidation],
        unification_coefficient: float
    ) -> List[str]:
        """Generate prescriptive recommendations based on validation results."""
        recommendations = []
        
        for v in validations:
            if not v.accessible:
                recommendations.append(
                    f"CRITICAL: Restore accessibility to {v.role.value} at {v.path}"
                )
            elif not v.identity_present:
                recommendations.append(
                    f"ACTION: Propagate NODE0_IDENTITY.yaml to {v.role.value}"
                )
            elif not v.identity_valid:
                recommendations.append(
                    f"REMEDIATE: Correct identity encumbrances in {v.role.value}: "
                    f"{', '.join(v.encumbrances)}"
                )
        
        if unification_coefficient < 0.95:
            recommendations.append(
                "PRIORITY: Unification coefficient below threshold (0.95). "
                "Execute ecosystem remediation protocol."
            )
        
        return recommendations
    
    def validate(self) -> EcosystemCoherenceReport:
        """
        Execute comprehensive ecosystem coherence validation.
        
        This method implements the full Graph of Thoughts validation topology,
        traversing hardware substrate, software layers, data space, and network
        identity to compute the unification coefficient.
        
        Returns:
            EcosystemCoherenceReport with complete validation results
        """
        self.logger.info("Initiating Node0 Ecosystem Coherence Validation")
        
        # Validate all components
        validations = [
            self._validate_component(role) 
            for role in ComponentRole
        ]
        
        # Compute weighted unification coefficient
        total_weight = sum(NODE0_COMPONENTS[v.role]["weight"] for v in validations)
        weighted_scores = sum(
            v.coherence_score * NODE0_COMPONENTS[v.role]["weight"]
            for v in validations
        )
        unification_coefficient = weighted_scores / total_weight if total_weight > 0 else 0.0
        
        # Determine coherence state
        if unification_coefficient >= 0.95:
            state = CoherenceState.UNIFIED
        elif unification_coefficient >= 0.70:
            state = CoherenceState.DEGRADED
        elif unification_coefficient > 0:
            state = CoherenceState.FRAGMENTED
        else:
            state = CoherenceState.UNKNOWN
        
        # Gather substrate and layer telemetry
        hardware = self._gather_hardware_substrate()
        software = self._gather_software_layers()
        
        # Compute Ihsan score
        ihsan_score = self._compute_ihsan_score(validations)
        
        # Aggregate encumbrances
        all_encumbrances = []
        for v in validations:
            all_encumbrances.extend(
                f"[{v.role.value}] {e}" for e in v.encumbrances
            )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            validations, unification_coefficient
        )
        
        # Resolve network identity
        try:
            network_identity = socket.gethostbyname(socket.gethostname())
        except Exception:
            network_identity = "unknown"
        
        report = EcosystemCoherenceReport(
            timestamp=datetime.now(timezone.utc),
            hostname=socket.gethostname(),
            network_identity=network_identity,
            state=state,
            unification_coefficient=unification_coefficient,
            component_validations=validations,
            hardware_substrate=hardware,
            software_layers=software,
            ihsan_score=ihsan_score,
            encumbrances=all_encumbrances,
            recommendations=recommendations,
        )
        
        self.logger.info(
            f"Validation complete: state={state.value}, "
            f"coefficient={unification_coefficient:.4f}, "
            f"ihsan={ihsan_score:.4f}"
        )
        
        return report


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLI INTERFACE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main():
    """Command-line entry point for ecosystem coherence validation."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s"
    )
    logger = logging.getLogger("node0.coherence")
    
    print("╔══════════════════════════════════════════════════════════════════════════════╗")
    print("║           NODE0 ECOSYSTEM COHERENCE VALIDATOR — GENESIS BLOCK               ║")
    print("║                    SAPE v1.∞ | Standing on Shoulders of Giants              ║")
    print("╚══════════════════════════════════════════════════════════════════════════════╝")
    print()
    
    validator = EcosystemCoherenceValidator(logger=logger)
    report = validator.validate()
    
    # Display results
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"  Timestamp:               {report.timestamp.isoformat()}")
    print(f"  Hostname:                {report.hostname}")
    print(f"  Network Identity:        {report.network_identity}")
    print(f"  Coherence State:         {report.state.value.upper()}")
    print(f"  Unification Coefficient: {report.unification_coefficient:.4f}")
    print(f"  Ihsan Score:             {report.ihsan_score:.4f}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("COMPONENT VALIDATION:")
    print()
    
    for cv in report.component_validations:
        status = "✓" if cv.identity_valid else ("⚠" if cv.accessible else "✗")
        print(f"  {status} {cv.role.value.upper():12} | Score: {cv.coherence_score:.2f} | "
              f"Alignment: {cv.canonical_alignment:.2f}")
        if cv.encumbrances:
            for e in cv.encumbrances:
                print(f"      └─ {e}")
    
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    if report.recommendations:
        print("RECOMMENDATIONS:")
        for r in report.recommendations:
            print(f"  → {r}")
        print()
    
    # Emit JSON report
    report_path = Path("/root/bizra-genesis/state/ecosystem_coherence_report.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report.to_dict(), f, indent=2)
    print(f"Report emitted: {report_path}")
    
    # Exit with appropriate code
    if report.state == CoherenceState.UNIFIED:
        print("\n✓ NODE0 GENESIS BLOCK: UNIFIED")
        sys.exit(0)
    elif report.state == CoherenceState.DEGRADED:
        print("\n⚠ NODE0 GENESIS BLOCK: DEGRADED — Remediation recommended")
        sys.exit(1)
    else:
        print("\n✗ NODE0 GENESIS BLOCK: FRAGMENTED — Immediate action required")
        sys.exit(2)


if __name__ == "__main__":
    main()
