#!/usr/bin/env python3
# tools/snr-engine/athlete_harness.py

import sys
import json
import argparse
from decimal import Decimal
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class SNRMetrics:
    signal_power: Decimal
    noise_power: Decimal
    snr_linear: Decimal
    snr_db: Decimal
    
    def is_elite(self) -> bool:
        """SNR ≥ 0.99 linear"""
        return self.snr_linear >= Decimal('0.99')
    
    def to_dict(self):
        return {
            "signal_power": float(self.signal_power),
            "noise_power": float(self.noise_power),
            "snr_linear": float(self.snr_linear),
            "snr_db": float(self.snr_db),
            "is_elite": self.is_elite()
        }

class AthleteSNREngine:
    """Athlete pattern: obsessive-compulsive optimization"""
    
    def __init__(self, noise_budget: Decimal = Decimal('0.01')):
        self.noise_budget = noise_budget
        self.violations = []
        
    def measure_snr(self, log_stream: List[Dict[str, Any]]) -> SNRMetrics:
        """Calculate SNR from structured logs"""
        signal = []
        noise = []
        
        for log in log_stream:
            # Signal: actionable metrics (error_code, duration, user_id)
            signal_score = Decimal('1.0') if any(k in log for k in ["error_code", "duration_ms", "user_id"]) else Decimal('0.1')
            signal.append(signal_score)
            
            # Noise: missing fields, type mismatches
            noise_score = Decimal('0.0')
            if "timestamp" not in log: noise_score += Decimal('0.5')
            if not isinstance(log.get("duration_ms", 0), int): noise_score += Decimal('0.3')
            # Relaxed check for correlation_id when present
            if "correlation_id" in log and not isinstance(log.get("correlation_id"), str): noise_score += Decimal('0.2')
            
            noise.append(noise_score)
        
        signal_power = sum(signal) / len(signal) if signal else Decimal('0')
        noise_power = sum(noise) / len(noise) if noise else Decimal('0.001')  # Avoid zero
        
        # Calculate linear SNR
        total_power = signal_power + noise_power
        if total_power == 0:
            snr_linear = Decimal(0)
        else:
            snr_linear = signal_power / total_power

        # Calculate dB
        if snr_linear >= 1:
            snr_db = Decimal('100.0') # Perfect
        elif snr_linear <= 0:
            snr_db = Decimal('-100.0')
        else:
            try:
                snr_db = Decimal('10') * (snr_linear / (Decimal('1') - snr_linear)).ln()
            except:
                snr_db = Decimal('0')

        if noise_power > self.noise_budget:
            self.violations.append({
                "type": "noise_budget_exceeded",
                "noise_power": float(noise_power),
                "budget": float(self.noise_budget)
            })
        
        return SNRMetrics(signal_power, noise_power, snr_linear, snr_db)

def main():
    parser = argparse.ArgumentParser(description="Calculate Signal-to-Noise Ratio (SNR) for logs")
    parser.add_argument('--log-file', type=str, help='Path to log file (JSONL)', required=True)
    parser.add_argument('--threshold', type=float, default=0.99, help='Metrics Threshold')
    parser.add_argument('--output', type=str, help='Output path for metrics JSON', default='snr-report.json')
    
    args = parser.parse_args()

    try:
        with open(args.log_file, 'r') as f:
            logs = [json.loads(line) for line in f]
    except Exception as e:
        print(f"Failed to read log file: {e}")
        raise SystemExit(2)

    engine = AthleteSNREngine()
    metrics = engine.measure_snr(logs)
    
    print(f"Signal Power: {metrics.signal_power:.4f}")
    print(f"Noise Power:  {metrics.noise_power:.4f}")
    print(f"SNR (Linear): {metrics.snr_linear:.4f}")
    print(f"SNR (dB):     {metrics.snr_db:.2f}")
    print(f"Elite Status: {'✅ YES' if metrics.is_elite() else '❌ NO'}")
    
    with open(args.output, 'w') as f:
        json.dump({"metrics": metrics.to_dict()}, f, indent=2)

if __name__ == "__main__":
    main()
