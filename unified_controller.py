#!/usr/bin/env python3
"""
BIZRA Unified Controller.
Run from the Genesis directory to control both WSL2 and Windows.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, Optional


def run_local(cmd: str) -> Dict[str, Any]:
    """Run a command locally in WSL."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr,
            "returncode": result.returncode,
        }
    except Exception as exc:
        return {"success": False, "error": str(exc), "returncode": 1}


def _load_windows_bridge() -> Optional[Any]:
    windows_bridge = None
    bridge_path = Path("integrations/windows/bridge.py")
    if not bridge_path.exists():
        return None

    sys.path.append(str(bridge_path.parent))
    try:
        from bridge import WindowsSynapseBridge

        windows_bridge = WindowsSynapseBridge()
    except Exception:
        return None
    return windows_bridge


def _print_header() -> None:
    print("=" * 60)
    print("BIZRA UNIFIED CONTROLLER")
    print("=" * 60)
    print(f"Directory: {Path.cwd()}")
    print(f"Genesis: {Path.cwd().name}")
    print("=" * 60)


def _print_help() -> None:
    print("Available commands:")
    print("  win:<cmd>       - Execute on Windows (via synapse)")
    print("  local:<cmd>     - Execute in WSL")
    print("  status          - Show system status")
    print("  help            - Show this help")
    print("  exit            - Exit")


def main() -> None:
    _print_header()
    windows_bridge = _load_windows_bridge()
    if windows_bridge:
        print("Windows integration available.")
    else:
        print("Windows integration not configured.")

    _print_help()
    print()

    while True:
        try:
            cmd = input("bizra> ").strip()
            if not cmd:
                continue

            if cmd.lower() in {"exit", "quit", "q"}:
                print("Goodbye.")
                break

            if cmd.lower() in {"help", "h", "?"}:
                _print_help()
                print()
                continue

            if cmd == "status":
                print("SYSTEM STATUS:")
                print(f"  Directory: {Path.cwd()}")
                if windows_bridge:
                    synapse_root = Path(windows_bridge.synapse_root)
                else:
                    synapse_root = Path(
                        os.getenv("BIZRA_WINDOWS_SYNAPSE_ROOT", "/mnt/c/bizra_synapse")
                    )
                print(f"  Synapse: {'exists' if synapse_root.exists() else 'missing'}")
                print(f"  Windows Bridge: {'available' if windows_bridge else 'unavailable'}")

                if windows_bridge:
                    print("  Testing Windows connection...")
                    result = windows_bridge.health_check()
                    if result.get("status") == "timeout":
                        print("  Windows: not responding")
                    else:
                        score = result.get("ihsan_score", 0.0)
                        print(f"  Windows: online (ihsan: {score:.2f})")
                print()
                continue

            if cmd.startswith("win:"):
                if not windows_bridge:
                    print("Windows bridge not available. Run integration setup first.")
                    print()
                    continue

                windows_cmd = cmd[4:].strip()
                if not windows_cmd:
                    print("Empty Windows command.")
                    print()
                    continue

                print(f"Sending to Windows: {windows_cmd}")
                result = windows_bridge.execute_command(windows_cmd)

                print("Result:")
                print("-" * 40)
                if result.get("output"):
                    print(result["output"])
                if result.get("error"):
                    print(f"Error: {result['error']}")
                if "ihsan_score" in result:
                    print(f"Ihsan Score: {result['ihsan_score']:.2f}")
                print("-" * 40)
                print()
                continue

            if cmd.startswith("local:"):
                local_cmd = cmd[6:].strip()
                if not local_cmd:
                    print("Empty local command.")
                    print()
                    continue

                print(f"Executing locally: {local_cmd}")
                result = run_local(local_cmd)
                print(f"Result (code: {result['returncode']}):")
                print("-" * 40)
                if result.get("output"):
                    print(result["output"])
                if result.get("error"):
                    print(f"Error: {result['error']}")
                print("-" * 40)
                print()
                continue

            print(f"Unknown command: {cmd}")
            print("Try: local:ls, status, exit")
            if not windows_bridge:
                print("Windows commands require integration setup.")
            print()

        except KeyboardInterrupt:
            print("\nUse 'exit' to quit.")
        except Exception as exc:
            print(f"Error: {exc}")


if __name__ == "__main__":
    main()
