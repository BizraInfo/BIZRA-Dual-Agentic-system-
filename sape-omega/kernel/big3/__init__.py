"""
Big3 Coordinator - Multi-AI Orchestration System

Coordinates Claude Code, OpenAI Codex, and Google Gemini as a unified team.

Philosophy: "We don't assume. If we must, we do it with Ihsān."
"""

from .coordinator import (
    Big3Coordinator,
    Big3Task,
    Big3Result,
    AIAgent,
    TaskType,
    AgentContribution,
)

__all__ = [
    "Big3Coordinator",
    "Big3Task",
    "Big3Result",
    "AIAgent",
    "TaskType",
    "AgentContribution",
]
__version__ = "1.0.0"
