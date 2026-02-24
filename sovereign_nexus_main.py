#!/usr/bin/env python3
"""
BIZRA Sovereign Nexus - Main Entry Point

This is the main entry point for the unified control interface of BIZRA Sovereign Intelligence.
It initializes and runs the SovereignNexus with all its subsystems.
"""

import asyncio
import argparse
import sys
from typing import Dict, Any

from bizra_kernel.sovereign_nexus import SovereignNexus


async def main():
    """Main entry point for the BIZRA Sovereign Nexus."""
    parser = argparse.ArgumentParser(description='BIZRA Sovereign Nexus - Unified Control Interface')
    parser.add_argument('--heartbeat-hz', type=float, default=147.0,
                        help='Frequency of the main heartbeat loop in Hz (default: 147.0)')
    parser.add_argument('--ihsan-threshold', type=float, default=0.95,
                        help='Minimum Ihsan compliance threshold (default: 0.95)')
    parser.add_argument('--snr-target', type=float, default=0.95,
                        help='Target SNR score for optimization (default: 0.95)')
    parser.add_argument('--enable-dreaming', action='store_true',
                        help='Enable autonomous dreaming capability')
    parser.add_argument('--demo', action='store_true',
                        help='Run a short demo instead of the full system')
    
    args = parser.parse_args()
    
    print("="*80)
    print("BIZRA SOVEREIGN NEXUS - UNIFIED CONTROL INTERFACE")
    print("="*80)
    print(f"Heartbeat Frequency: {args.heartbeat_hz}Hz")
    print(f"Ihsan Threshold: {args.ihsan_threshold}")
    print(f"SNR Target: {args.snr_target}")
    print(f"Autonomous Dreaming: {'ENABLED' if args.enable_dreaming else 'DISABLED'}")
    print("="*80)
    
    # Initialize the SovereignNexus
    nexus = SovereignNexus(
        heartbeat_hz=args.heartbeat_hz,
        ihsan_threshold=args.ihsan_threshold,
        snr_target=args.snr_target,
        enable_dreaming=args.enable_dreaming
    )
    
    try:
        # Initialize the nexus
        await nexus.initialize()
        
        if args.demo:
            # Run a brief demo
            await run_demo(nexus)
        else:
            # Run the full system
            print("\nStarting BIZRA Sovereign Nexus heartbeat loop...")
            print("Press Ctrl+C to stop the system")
            
            # Start the heartbeat loop
            await nexus.run_heartbeat_loop()
            
    except KeyboardInterrupt:
        print("\nReceived interrupt signal. Shutting down gracefully...")
    except Exception as e:
        print(f"Error running BIZRA Sovereign Nexus: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Always shut down the nexus
        await nexus.shutdown()
        print("BIZRA Sovereign Nexus shutdown complete.")


async def run_demo(nexus: SovereignNexus):
    """Run a brief demo of the SovereignNexus capabilities."""
    print("\n" + "="*50)
    print("BIZRA SOVEREIGN NEXUS DEMO")
    print("="*50)
    
    # Get system status
    print("\n1. Checking system status...")
    status = await nexus.get_system_status()
    print(f"   Nexus Status: {status['nexus_status']}")
    print(f"   Heartbeat Count: {status['heartbeat_count']}")
    print(f"   SNR Score: {status['snr_metrics'].get('snr_score', 'N/A')}")
    print(f"   Ihsan Score: {status['ihsan_score']}")
    
    # Process a sample request
    print("\n2. Processing sample request...")
    request = {
        'query': 'Explain the intersection of ethics and artificial intelligence',
        'context': {'discipline': 'ethics'}
    }
    
    response = await nexus.process_request(request)
    print(f"   Success: {response['success']}")
    print(f"   Confidence: {response.get('confidence', 'N/A')}")
    print(f"   Processing Path: {response['metadata']['processing_path']}")
    
    # Execute a sample agentic task
    print("\n3. Executing sample agentic task...")
    task_spec = {
        'agent_type': 'researcher',
        'goal': 'Research recent developments in ethical AI',
        'context': {'topic': 'ethical AI', 'timeframe': 'last_year'},
        'timeout': 10
    }
    
    task_result = await nexus.execute_agentic_task(task_spec)
    print(f"   Task Success: {task_result['success']}")
    if task_result['success']:
        print(f"   Result Preview: {str(task_result['result'])[:100]}...")
    
    # Show subsystem status
    print("\n4. Subsystem Status:")
    for subsys, status in status['subsystem_status'].items():
        print(f"   {subsys.title()}: {status}")
    
    print("\n" + "="*50)
    print("DEMO COMPLETE")
    print("="*50)


if __name__ == "__main__":
    asyncio.run(main())