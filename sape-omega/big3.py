#!/usr/bin/env python3
"""
Big3 Coordinator CLI

Command-line interface for multi-AI orchestration using Claude Code,
OpenAI Codex, and Google Gemini working together.

Usage:
    python3 big3.py demo                    # Run demonstration
    python3 big3.py execute --task "..."    # Execute custom task
    python3 big3.py omega --query "..."     # Execute with OMEGA pipeline
    python3 big3.py stats                   # Show statistics

Philosophy: "We don't assume. If we must, we do it with Ihsān."
"""

import argparse
import asyncio
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from kernel.big3 import Big3Coordinator, Big3Task, TaskType, AIAgent
from kernel.omega_big3_integration import OmegaBig3Orchestrator, OmegaBig3Config, execute_with_big3
from kernel.omega_orchestrator import OmegaMission


def print_banner():
    """Print Big3 banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   ██████╗ ██╗ ██████╗ ██████╗     ██████╗  ██████╗ ██████╗ ║
    ║   ██╔══██╗██║██╔════╝ ╚════██╗   ██╔═████╗██╔═████╗╚════██╗║
    ║   ██████╔╝██║██║  ███╗ █████╔╝   ██║██╔██║██║██╔██║ █████╔╝║
    ║   ██╔══██╗██║██║   ██║ ╚═══██╗   ████╔╝██║████╔╝██║ ╚═══██╗║
    ║   ██████╔╝██║╚██████╔╝██████╔╝   ╚██████╔╝╚██████╔╝██████╔╝║
    ║   ╚═════╝ ╚═╝ ╚═════╝ ╚═════╝     ╚═════╝  ╚═════╝ ╚═════╝ ║
    ║                                                              ║
    ║            Multi-AI Orchestration System v1.0               ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝

    The Big 3: Claude Code + OpenAI Codex + Google Gemini
    Philosophy: "We don't assume. If we must, we do it with Ihsān."
    """
    print(banner)


async def demo_basic_coordination():
    """Demonstrate basic Big3 coordination"""
    print("\n" + "="*80)
    print("🎯 DEMO: Basic Big3 Coordination")
    print("="*80)

    coordinator = Big3Coordinator(
        enable_codex=True,
        enable_gemini=True,
    )

    # Task 1: Code generation
    print("\n📋 Task 1: Code Generation")
    task1 = Big3Task(
        task_id="DEMO-CODE-001",
        description="Write a Python function to calculate Fibonacci numbers efficiently",
        task_type=TaskType.CODE_GENERATION,
        priority=7,
    )
    result1 = await coordinator.execute(task1)
    print(f"✅ Result: SNR={result1.snr_score:.4f}, Ihsān={result1.ihsan_score:.4f}")

    # Task 2: Data analysis
    print("\n📋 Task 2: Data Analysis")
    task2 = Big3Task(
        task_id="DEMO-DATA-001",
        description="Analyze patterns in Quranic corpus word frequency distribution",
        task_type=TaskType.DATA_MINING,
        priority=8,
    )
    result2 = await coordinator.execute(task2)
    print(f"✅ Result: SNR={result2.snr_score:.4f}, Ihsān={result2.ihsan_score:.4f}")

    # Task 3: Knowledge synthesis
    print("\n📋 Task 3: Knowledge Synthesis")
    task3 = Big3Task(
        task_id="DEMO-SYNTH-001",
        description="Synthesize insights from codebase structure and documentation",
        task_type=TaskType.SYNTHESIS,
        priority=6,
    )
    result3 = await coordinator.execute(task3)
    print(f"✅ Result: SNR={result3.snr_score:.4f}, Ihsān={result3.ihsan_score:.4f}")

    # Summary
    print("\n" + "="*80)
    print("📊 DEMONSTRATION SUMMARY")
    print("="*80)
    stats = coordinator.get_stats()
    print(f"Total Tasks:       {stats['total_tasks']}")
    print(f"Successful:        {stats['successful_tasks']}")
    print(f"Failed:            {stats['failed_tasks']}")
    print(f"Avg Consensus:     {stats['avg_consensus']:.3f}")
    print(f"Avg SNR:           {stats['avg_snr']:.3f}")
    print(f"Avg Ihsān:         {stats['avg_ihsan']:.3f}")
    print()


async def demo_omega_integration():
    """Demonstrate OMEGA + Big3 integration"""
    print("\n" + "="*80)
    print("🎯 DEMO: OMEGA + Big3 Integration")
    print("="*80)

    config = OmegaBig3Config(
        enable_big3=True,
        enable_codex=True,
        enable_gemini=True,
        big3_phases=["synthesis", "validation"],
    )

    orchestrator = OmegaBig3Orchestrator(config=config)

    mission = OmegaMission(
        mission_id="DEMO-OMEGA-BIG3-001",
        query="Design a distributed knowledge graph ingestion pipeline for Quranic corpus data",
    )

    result = await orchestrator.execute_mission(mission)

    print("\n" + "="*80)
    print("📊 OMEGA + BIG3 RESULT")
    print("="*80)
    print(f"Mission ID:        {result.mission_id}")
    print(f"SNR Score:         {result.snr_score:.4f} {'✅' if result.snr_score >= 0.995 else '❌'}")
    print(f"Ihsān Score:       {result.ihsan_score:.4f} {'✅' if result.ihsan_score >= 0.997 else '❌'}")
    print(f"Confidence:        {result.confidence:.4f}")
    print(f"Evidence Hash:     {result.evidence_hash}")
    print(f"Execution Time:    {result.execution_time_ms}ms")
    print()


async def execute_task(task_description: str, task_type_str: str, output_file: str):
    """Execute a custom Big3 task"""
    print("\n" + "="*80)
    print("🎯 EXECUTING CUSTOM BIG3 TASK")
    print("="*80)

    # Parse task type
    try:
        task_type = TaskType[task_type_str.upper()]
    except KeyError:
        print(f"❌ Invalid task type: {task_type_str}")
        print(f"   Valid types: {', '.join(t.name.lower() for t in TaskType)}")
        return

    coordinator = Big3Coordinator()

    task = Big3Task(
        task_id=f"CUSTOM-{int(datetime.utcnow().timestamp())}",
        description=task_description,
        task_type=task_type,
        priority=7,
    )

    result = await coordinator.execute(task)

    # Save result
    if output_file:
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(result.to_dict(), f, indent=2)
        print(f"💾 Result saved to: {output_path}")

    print("\n" + "="*80)
    print("✅ TASK COMPLETE")
    print("="*80)


async def execute_omega_query(query: str, output_file: str):
    """Execute OMEGA mission with Big3 coordination"""
    print("\n" + "="*80)
    print("🎯 EXECUTING OMEGA MISSION WITH BIG3")
    print("="*80)

    result = await execute_with_big3(
        query=query,
        enable_codex=True,
        enable_gemini=True,
    )

    # Save result
    if output_file:
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(result.to_dict(), f, indent=2)
        print(f"💾 Result saved to: {output_path}")

    print("\n" + "="*80)
    print("✅ OMEGA MISSION COMPLETE")
    print("="*80)


def show_stats():
    """Show Big3 statistics"""
    print("\n" + "="*80)
    print("📊 BIG3 STATISTICS")
    print("="*80)
    print("\nStatistics are tracked per session.")
    print("Run tasks to see coordination metrics.\n")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Big3 Multi-AI Orchestration System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run basic demonstration
  python3 big3.py demo

  # Run OMEGA integration demo
  python3 big3.py demo --omega

  # Execute custom task
  python3 big3.py execute --task "Write a data pipeline" --type data_pipeline

  # Execute OMEGA mission with Big3
  python3 big3.py omega --query "Design consensus algorithm" --output result.json

Philosophy: "We don't assume. If we must, we do it with Ihsān."
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # Demo command
    demo_parser = subparsers.add_parser("demo", help="Run demonstration")
    demo_parser.add_argument(
        "--omega",
        action="store_true",
        help="Demonstrate OMEGA + Big3 integration"
    )

    # Execute command
    execute_parser = subparsers.add_parser("execute", help="Execute custom task")
    execute_parser.add_argument(
        "--task",
        required=True,
        help="Task description"
    )
    execute_parser.add_argument(
        "--type",
        default="synthesis",
        help="Task type (e.g., code_generation, data_mining, synthesis)"
    )
    execute_parser.add_argument(
        "--output",
        default="/tmp/big3_result.json",
        help="Output file for result"
    )

    # Omega command
    omega_parser = subparsers.add_parser("omega", help="Execute OMEGA mission with Big3")
    omega_parser.add_argument(
        "--query",
        required=True,
        help="Mission query/description"
    )
    omega_parser.add_argument(
        "--output",
        default="/tmp/omega_big3_result.json",
        help="Output file for result"
    )

    # Stats command
    stats_parser = subparsers.add_parser("stats", help="Show statistics")

    args = parser.parse_args()

    print_banner()

    # Check environment
    has_openai = "OPENAI_API_KEY" in os.environ
    has_gemini = "GOOGLE_API_KEY" in os.environ

    print("🔧 Environment Check:")
    print(f"   OpenAI API:  {'✅' if has_openai else '❌ (Set OPENAI_API_KEY)'}")
    print(f"   Gemini API:  {'✅' if has_gemini else '❌ (Set GOOGLE_API_KEY)'}")
    print()

    if not args.command:
        parser.print_help()
        return

    # Execute command
    try:
        if args.command == "demo":
            if args.omega:
                asyncio.run(demo_omega_integration())
            else:
                asyncio.run(demo_basic_coordination())
        elif args.command == "execute":
            asyncio.run(execute_task(args.task, args.type, args.output))
        elif args.command == "omega":
            asyncio.run(execute_omega_query(args.query, args.output))
        elif args.command == "stats":
            show_stats()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
