# Synaptic Integration Test (Python <-> Rust <-> Node0)

import unittest
import json
import sys
import os

# Add relevant paths
sys.path.append(os.path.abspath("python/council_runtime"))

# Check if synapse_py is available
SYNAPSE_AVAILABLE = False
try:
    import synapse_py
    SYNAPSE_AVAILABLE = True
except ImportError:
    pass


class TestSynapticIntegration(unittest.TestCase):
    """Integration tests for Python <-> Rust synapse bridge."""
    
    def test_dryrun_placeholder(self):
        """Always-run test to verify test framework works."""
        self.assertTrue(True, "Dry run test passed")
    
    @unittest.skipUnless(SYNAPSE_AVAILABLE, "synapse_py not available (run maturin develop)")
    def test_receipt_payload_returns_json(self):
        """Test that receipt_payload returns valid JSON."""
        from synapse_adapter import CouncilSynapse
        synapse = CouncilSynapse()
        # Add a goal thought first
        synapse.propose("Test goal", parents=[], meta={"role": "TESTER"})
        payload = synapse.receipt_payload()
        self.assertIsInstance(payload, dict)
        self.assertIn("synapse_version", payload)


if __name__ == "__main__":
    unittest.main()
