#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
    BIZRA APEX CLI - Command Line Interface
    Peak Masterpiece Production System
═══════════════════════════════════════════════════════════════════════════════

THE LAW: "We don't assume. If we must, we do it with Ihsān."

Usage:
    python -m apex_engine.cli orchestrate --mission "Your mission"
    python -m apex_engine.cli validate --evidence path/to/file
    python -m apex_engine.cli status
    python -m apex_engine.cli version

═══════════════════════════════════════════════════════════════════════════════
"""

import argparse
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

# Import orchestrator
try:
    from .orchestrator import ApexOrchestrator, VERSION, CODENAME, THE_LAW
except ImportError:
    from orchestrator import ApexOrchestrator, VERSION, CODENAME, THE_LAW


def banner():
    """Display the BIZRA banner."""
    print("""
═══════════════════════════════════════════════════════════════════════════════
    ██████╗ ██╗███████╗██████╗  █████╗ 
    ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗
    ██████╔╝██║  ███╔╝ ██████╔╝███████║
    ██╔══██╗██║ ███╔╝  ██╔══██╗██╔══██║
    ██████╔╝██║███████╗██║  ██║██║  ██║
    ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
    
    APEX ENGINE - Unified Production Orchestrator
═══════════════════════════════════════════════════════════════════════════════
    """)


def cmd_orchestrate(args):
    """Execute the orchestration pipeline."""
    banner()
    print(f"🎯 Mission: {args.mission}\n")
    
    orchestrator = ApexOrchestrator(
        mission=args.mission,
        context={"cli": True, "timestamp": datetime.now(timezone.utc).isoformat()}
    )
    
    # Add evidence from files if provided
    if args.evidence:
        for ev_path in args.evidence:
            path = Path(ev_path)
            if path.exists():
                orchestrator.add_evidence(str(path), f"Evidence from {path.name}")
                print(f"📎 Added evidence: {path}")
            else:
                print(f"⚠️ Evidence file not found: {path}")
    
    # Add default evidence
    orchestrator.add_evidence("CLI", f"Orchestration initiated via CLI at {datetime.now(timezone.utc).isoformat()}")
    orchestrator.add_evidence("SYSTEM", f"BIZRA Apex Engine v{VERSION}")
    orchestrator.add_evidence("THE_LAW", THE_LAW)
    
    # Execute
    receipt = orchestrator.run()
    
    # Save receipt if output specified
    if args.output:
        output_path = Path(args.output)
        with open(output_path, "w") as f:
            json.dump({
                "id": receipt.id,
                "version": receipt.version,
                "final_scores": receipt.final_scores,
                "recommendation": receipt.recommendation,
                "hash": receipt.hash
            }, f, indent=2)
        print(f"\n📜 Receipt saved: {output_path}")
    
    return 0 if "PROCEED" in receipt.recommendation else 1


def cmd_validate(args):
    """Validate evidence files."""
    banner()
    print("🔍 Validating Evidence...\n")
    
    valid = 0
    invalid = 0
    
    for ev_path in args.files:
        path = Path(ev_path)
        if path.exists():
            size = path.stat().st_size
            print(f"  ✅ {path}: {size} bytes")
            valid += 1
        else:
            print(f"  ❌ {path}: NOT FOUND")
            invalid += 1
    
    print(f"\n📊 Results: {valid} valid, {invalid} invalid")
    return 0 if invalid == 0 else 1


def cmd_status(args):
    """Show system status."""
    banner()
    print(f"""
┌─────────────────────────────────────────────────────────────────────────────┐
│ BIZRA APEX ENGINE - System Status                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Version:      {VERSION}                                                    │
│  Codename:     {CODENAME}                                             │
│  Status:       ✅ OPERATIONAL                                               │
│  Timestamp:    {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  THE LAW:      "{THE_LAW}"             │
└─────────────────────────────────────────────────────────────────────────────┘

Components:
  ✅ ApexOrchestrator     - Unified production orchestrator
  ✅ IhsanConstitution    - 8-dimensional ethical framework
  ✅ SNREngine            - Signal-to-noise optimization
  ✅ SAPEFramework        - Self-aware performance elevation
  ✅ GiantsProtocol       - 7 elite methodologies
  ✅ GoTSynthesisHub      - Graph of Thoughts synthesis

Ready for production deployment.
    """)
    return 0


def cmd_version(args):
    """Show version information."""
    print(f"BIZRA Apex Engine v{VERSION} ({CODENAME})")
    print(f"THE LAW: {THE_LAW}")
    return 0


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="bizra-apex",
        description="BIZRA Apex Engine - Peak Masterpiece Production System"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Orchestrate command
    p_orchestrate = subparsers.add_parser("orchestrate", help="Execute orchestration pipeline")
    p_orchestrate.add_argument("-m", "--mission", required=True, help="Mission statement")
    p_orchestrate.add_argument("-e", "--evidence", nargs="*", help="Evidence files")
    p_orchestrate.add_argument("-o", "--output", help="Output receipt path")
    p_orchestrate.set_defaults(func=cmd_orchestrate)
    
    # Validate command
    p_validate = subparsers.add_parser("validate", help="Validate evidence files")
    p_validate.add_argument("files", nargs="+", help="Files to validate")
    p_validate.set_defaults(func=cmd_validate)
    
    # Status command
    p_status = subparsers.add_parser("status", help="Show system status")
    p_status.set_defaults(func=cmd_status)
    
    # Version command
    p_version = subparsers.add_parser("version", help="Show version")
    p_version.set_defaults(func=cmd_version)
    
    args = parser.parse_args()
    
    if args.command is None:
        banner()
        parser.print_help()
        return 0
    
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
