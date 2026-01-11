#!/usr/bin/env python3
"""
BIZRA COGNITIVE PLANE - SAT REFLEX ENGINE
Plane: Cognitive
Component: Self-Audit Toolkit (SAT)
Status: ACTIVE
Implements: Ihsān Manifest (Amanah & Excellence)

The SAT Reflex Engine is the "Immune System" of the BIZRA Node.
It performs rapid, regex-based heuristic analysis on the codebase to ensure
adherence to the Sovereign Constitution before operations are allowed to proceed.
"""

import sys
import yaml
import re
import logging
from pathlib import Path
from typing import Dict, List, Any

# Configure Logging (High SNR)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | SAT-REFLEX | %(levelname)s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("SAT")

class SatReflex:
    def __init__(self, manifest_path: Path):
        self.manifest_path = manifest_path
        self.manifest = self._load_manifest()
        self.reflex_circuits = self._init_circuits()

    def _load_manifest(self) -> Dict[str, Any]:
        """Loads the Operational Law (Ihsan Manifest)."""
        # Resolve absolute path relative to this script
        base_path = Path(__file__).parent
        resolved_manifest = (base_path / "../../constitution/ihsan_manifest.yaml").resolve()
        
        try:
            with open(resolved_manifest, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.critical(f"FATAL: Constitution missing or corrupt. {e}")
            sys.exit(1)

    def _init_circuits(self) -> Dict[str, str]:
        """
        Regex Reflex Circuits.
        In a full implementation, these would be dynamic policies.
        Here, we hardcode the 'Reflex' patterns for speed (Ring 0 thinking).
        """
        return {
            "SECRET_LEAK": r"(?i)(api_?key|generated_token|password|secret)\s*=\s*['\"][^'\"]+['\"]",
            "IP_HARDCODE": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
            "UNSAFE_EXEC": r"(?i)(eval|exec|os\.system|subprocess\.call)\(",
        }

    def scan_path(self, target_path: Path) -> bool:
        """
        Scans a file or directory for violations.
        Returns True if SAFE, False if VIOLATION found.
        """
        logger.info(f"Scanning target: {target_path}")
        
        all_clear = True
        
        if target_path.is_file():
            files = [target_path]
        else:
            files = target_path.rglob("*")

        for file in files:
            if not file.is_file(): continue
            if file.suffix not in ['.py', '.sh', '.js', '.ts', '.rs']: continue
            
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                for circuit_name, pattern in self.reflex_circuits.items():
                    if re.search(pattern, content):
                        # EXCEPTION: Allow this file to contain the patterns (self-reference)
                        if file.name == "reflex_engine.py": continue
                        if "test" in file.name.lower(): continue # Skip tests

                        logger.warning(f"VIOLATION [{circuit_name}] detected in {file.name}")
                        all_clear = False
            except Exception as e:
                logger.error(f"Scan error on {file}: {e}")

        if all_clear:
            logger.info("✅ SAT Check Passed: System Integrity Verified.")
        else:
            logger.error("🚫 SAT Check Failed: Violations Detected.")
            
        return all_clear

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 reflex_engine.py <target_path>")
        sys.exit(1)

    manifest = Path("../../constitution/ihsan_manifest.yaml")
    engine = SatReflex(manifest)
    
    target = Path(sys.argv[1])
    is_safe = engine.scan_path(target)
    
    # Exit code: 0 if safe, 1 if unsafe
    sys.exit(0 if is_safe else 1)
