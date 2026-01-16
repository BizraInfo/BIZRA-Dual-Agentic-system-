#!/usr/bin/env python3
"""
SAPE OMEGA CLI
Command-line interface for the Peak Masterpiece system

Commands:
  demo      - Run the ultimate demonstration
  solve     - Execute a custom mission
  verify    - Verify an evidence hash
  stats     - Show orchestrator statistics
  help      - Show this help message

Philosophy: "We don't assume. If we must, we do it with Ihsān."
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from kernel.omega_orchestrator import (
    OmegaOrchestrator,
    OmegaMission,
    PerspectiveLens,
)


def print_banner():
    """Print SAPE OMEGA banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   ███████╗ █████╗ ██████╗ ███████╗    ██████╗ ███╗   ███╗  ║
    ║   ██╔════╝██╔══██╗██╔══██╗██╔════╝   ██╔═══██╗████╗ ████║  ║
    ║   ███████╗███████║██████╔╝█████╗     ██║   ██║██╔████╔██║  ║
    ║   ╚════██║██╔══██║██╔═══╝ ██╔══╝     ██║   ██║██║╚██╔╝██║  ║
    ║   ███████║██║  ██║██║     ███████╗   ╚██████╔╝██║ ╚═╝ ██║  ║
    ║   ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝    ╚═════╝ ╚═╝     ╚═╝  ║
    ║                                                              ║
    ║              The Peak Masterpiece - v1.0.0-OMEGA            ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝

    Philosophy: "We don't assume. If we must, we do it with Ihsān."
    Target: SNR ≥ 0.995 | Ihsān ≥ 0.997 | Cryptographic Proof
    """
    print(banner)


async def cmd_demo(args):
    """Run the ultimate demonstration"""
    print_banner()

    print("\n" + "="*80)
    print("🎯 OMEGA DEMONSTRATION")
    print("="*80)
    print("\nExecuting the ultimate proof of mastery...")
    print("Query: Design a Byzantine fault-tolerant consensus algorithm\n")

    orchestrator = OmegaOrchestrator(enable_federation=args.federation)

    mission = OmegaMission(
        mission_id="DEMO-001",
        query="Design a Byzantine fault-tolerant consensus algorithm for distributed AI agents",
    )

    try:
        result = await orchestrator.execute_mission(mission)

        # Print results
        print("\n" + "="*80)
        print("✨ DEMONSTRATION COMPLETE")
        print("="*80)

        print(f"\n📊 Quality Metrics:")
        print(f"   SNR Score:    {result.snr_score:.6f} {'✅' if result.snr_score >= 0.995 else '❌'}")
        print(f"   Ihsān Score:  {result.ihsan_score:.6f} {'✅' if result.ihsan_score >= 0.997 else '❌'}")
        print(f"   Confidence:   {result.confidence:.6f}")

        print(f"\n🔐 Cryptographic Proof:")
        print(f"   Evidence Hash: {result.evidence_hash}")
        print(f"   Signed At:     {result.signed_at}")

        print(f"\n⏱️  Performance:")
        print(f"   Total Time:    {result.execution_time_ms}ms")
        print(f"   Phases:")
        for phase, timing_ms in result.phase_timings.items():
            print(f"      {phase:20} {timing_ms:6}ms")

        print(f"\n🏛️  Foundations:")
        for foundation in result.giants_foundations:
            print(f"   • {foundation}")

        if args.output:
            # Save full result to JSON
            output_path = Path(args.output)
            with open(output_path, 'w') as f:
                json.dump(result.to_dict(), f, indent=2)
            print(f"\n💾 Full result saved to: {output_path}")

        print("\n✅ DEMONSTRATION SUCCESSFUL\n")
        return 0

    except Exception as e:
        print(f"\n❌ DEMONSTRATION FAILED: {e}\n")
        return 1


async def cmd_solve(args):
    """Execute a custom mission"""
    print_banner()

    if not args.query:
        print("❌ Error: --query is required for solve command")
        print("Example: python omega.py solve --query \"Your question here\"")
        return 1

    orchestrator = OmegaOrchestrator(enable_federation=args.federation)

    # Parse lenses if provided
    lenses = []
    if args.lenses:
        for lens_name in args.lenses.split(','):
            try:
                lenses.append(PerspectiveLens[lens_name.upper()])
            except KeyError:
                print(f"⚠️  Warning: Unknown lens '{lens_name}', skipping")

    mission = OmegaMission(
        mission_id=args.mission_id or f"MISSION-{int(asyncio.get_event_loop().time())}",
        query=args.query,
        required_lenses=lenses or list(PerspectiveLens),
        target_snr=args.snr or 0.995,
        target_ihsan=args.ihsan or 0.997,
    )

    try:
        result = await orchestrator.execute_mission(mission)

        print(f"\n{'='*80}")
        print(f"✨ MISSION COMPLETE: {result.mission_id}")
        print(f"{'='*80}")
        print(f"\nSNR: {result.snr_score:.6f} | Ihsān: {result.ihsan_score:.6f}")
        print(f"Evidence Hash: {result.evidence_hash}\n")

        if args.output:
            output_path = Path(args.output)
            with open(output_path, 'w') as f:
                json.dump(result.to_dict(), f, indent=2)
            print(f"💾 Result saved to: {output_path}\n")
        else:
            print("Solution:")
            print(result.solution)
            print()

        return 0

    except Exception as e:
        print(f"\n❌ MISSION FAILED: {e}\n")
        return 1


async def cmd_verify(args):
    """Verify an evidence hash"""
    if not args.hash:
        print("❌ Error: --hash is required for verify command")
        return 1

    print(f"\n🔍 Verifying evidence hash: {args.hash}\n")

    # In a full implementation, this would check against a receipt store
    # For now, we just validate the format
    if len(args.hash) == 64:  # SHA256 hex length
        print(f"✅ Hash format valid (SHA256)")
        print(f"⚠️  Full verification requires receipt store integration")
        return 0
    else:
        print(f"❌ Invalid hash format (expected 64 hex characters)")
        return 1


async def cmd_stats(args):
    """Show orchestrator statistics"""
    orchestrator = OmegaOrchestrator()
    stats = orchestrator.get_stats()

    print(f"\n{'='*80}")
    print(f"📊 SAPE OMEGA STATISTICS")
    print(f"{'='*80}\n")

    print(f"Total Missions:        {stats['total_missions']}")
    print(f"Total Execution Time:  {stats['total_execution_time_ms']}ms")
    print(f"Avg Execution Time:    {stats['avg_execution_time_ms']:.2f}ms")
    print(f"Federation Enabled:    {stats['federation_enabled']}")
    print(f"\nQuality Thresholds:")
    print(f"  SNR:                 ≥{stats['snr_threshold']:.3f}")
    print(f"  Ihsān:               ≥{stats['ihsan_threshold']:.3f}")
    print()

    if args.json:
        print(json.dumps(stats, indent=2))

    return 0


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="SAPE OMEGA - The Peak Masterpiece",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run demonstration
  python omega.py demo

  # Solve custom mission
  python omega.py solve --query "Your question here"

  # Show statistics
  python omega.py stats

  # Verify evidence hash
  python omega.py verify --hash <hash>

Philosophy: "We don't assume. If we must, we do it with Ihsān."
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # Demo command
    demo_parser = subparsers.add_parser('demo', help='Run ultimate demonstration')
    demo_parser.add_argument('--output', '-o', help='Save result to JSON file')
    demo_parser.add_argument('--federation', action='store_true', help='Enable federation')

    # Solve command
    solve_parser = subparsers.add_parser('solve', help='Execute custom mission')
    solve_parser.add_argument('--query', '-q', required=True, help='Mission query')
    solve_parser.add_argument('--mission-id', help='Custom mission ID')
    solve_parser.add_argument('--lenses', help='Comma-separated lens names')
    solve_parser.add_argument('--snr', type=float, help='Target SNR (default: 0.995)')
    solve_parser.add_argument('--ihsan', type=float, help='Target Ihsān (default: 0.997)')
    solve_parser.add_argument('--output', '-o', help='Save result to JSON file')
    solve_parser.add_argument('--federation', action='store_true', help='Enable federation')

    # Verify command
    verify_parser = subparsers.add_parser('verify', help='Verify evidence hash')
    verify_parser.add_argument('--hash', required=True, help='Evidence hash to verify')

    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show statistics')
    stats_parser.add_argument('--json', action='store_true', help='Output as JSON')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    # Execute command
    if args.command == 'demo':
        return asyncio.run(cmd_demo(args))
    elif args.command == 'solve':
        return asyncio.run(cmd_solve(args))
    elif args.command == 'verify':
        return asyncio.run(cmd_verify(args))
    elif args.command == 'stats':
        return asyncio.run(cmd_stats(args))
    else:
        parser.print_help()
        return 1


if __name__ == '__main__':
    sys.exit(main())
