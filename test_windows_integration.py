#!/usr/bin/env python3
"""
Test Windows Integration for BIZRA Genesis.
"""
import os
import sys


def main() -> int:
    root_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(os.path.join(root_dir, "integrations", "windows"))

    try:
        from bridge import WindowsSynapseBridge
    except ImportError as exc:
        print(f"Import error: {exc}")
        print("Run this from the bizra-genesis directory.")
        return 1

    print("Testing Windows integration")
    print("=" * 50)

    bridge = WindowsSynapseBridge()
    print(f"Synapse root: {bridge.synapse_root}")
    synapse_exists = os.path.exists(bridge.synapse_root)
    print(f"Synapse exists: {'yes' if synapse_exists else 'no'}")

    if synapse_exists:
        print("Testing Windows connection...")
        result = bridge.health_check()
        if result.get("status") == "timeout":
            print("Windows agent not responding.")
            print("Start it on Windows: python C:\\bizra_synapse\\windows_agent.py")
        else:
            print("Windows connection OK.")
            output = result.get("output", "")
            if output:
                print(f"Output: {output.strip()[:80]}")
            print(f"Ihsan score: {result.get('ihsan_score', 0):.2f}")

    print("=" * 50)
    print("Commands to try in your Genesis system:")
    print("  - win:dir")
    print("  - win:echo Hello from Windows")
    print("  - win:python --version")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
