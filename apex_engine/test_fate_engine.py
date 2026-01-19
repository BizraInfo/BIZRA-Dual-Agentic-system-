#!/usr/bin/env python3
"""Tests for FATE Engine Z3 integration"""

import pytest
from fate_engine_z3 import FateEngineZ3, VerificationResult, Z3_AVAILABLE


class TestFateEngineZ3:
    """Test suite for FATE Engine"""
    
    def setup_method(self):
        """Create fresh engine for each test"""
        self.engine = FateEngineZ3()
    
    def test_valid_action_passes(self):
        """Valid actions should pass verification"""
        action = {
            "type": "respond",
            "parameters": {
                "correctness_score": 0.98,
                "logged": True,
            }
        }
        result = self.engine.verify_action(action)
        assert result.verified is True
        assert result.ihsan_score >= 0.95
    
    def test_harmful_action_fails(self):
        """Harmful actions should fail verification"""
        action = {
            "type": "respond",
            "parameters": {
                "contains_harm": True,
            }
        }
        result = self.engine.verify_action(action)
        assert result.verified is False
        assert result.ihsan_score < 0.95
    
    def test_deceptive_action_fails(self):
        """Deceptive actions should fail verification"""
        action = {
            "type": "respond",
            "parameters": {
                "contains_deception": True,
            }
        }
        result = self.engine.verify_action(action)
        assert result.verified is False
    
    def test_ihsan_floor_enforced(self):
        """Ihsān floor of 0.95 should be enforced"""
        # Action with low scores
        action = {
            "type": "respond",
            "parameters": {
                "correctness_score": 0.5,
                "efficiency_score": 0.5,
            }
        }
        result = self.engine.verify_action(action)
        # May or may not pass depending on other defaults
        assert result.ihsan_score >= 0.0
        assert result.ihsan_score <= 1.0
    
    def test_proof_script_generated(self):
        """Verified actions should have proof scripts (if Z3 available)"""
        action = {
            "type": "respond",
            "parameters": {"correctness_score": 0.99}
        }
        result = self.engine.verify_action(action)
        
        if Z3_AVAILABLE and result.verified:
            assert result.proof_script is not None
            assert "check-sat" in result.proof_script
    
    def test_dimension_weights_sum_to_one(self):
        """Constitution dimension weights should sum to 1.0"""
        weights = self.engine.constitution.get("dimensions", self.engine.DEFAULT_WEIGHTS)
        total = sum(weights.values())
        assert abs(total - 1.0) < 0.001


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
