#!/usr/bin/env python3
"""
Simple Windows bridge for BIZRA Genesis.
Exchanges JSON jobs via a shared folder (synapse).
"""
from __future__ import annotations

import json
import logging
import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

DEFAULT_SYNAPSE_ROOT = "/mnt/c/bizra_synapse"
DEFAULT_TIMEOUT_S = 30.0
DEFAULT_POLL_INTERVAL_S = 0.5


class WindowsSynapseBridge:
    """Bridge to Windows tools via a shared filesystem inbox/outbox."""

    def __init__(
        self,
        synapse_root: Optional[str] = None,
        timeout_s: Optional[float] = None,
        poll_interval_s: Optional[float] = None,
    ) -> None:
        env_root = os.getenv("BIZRA_WINDOWS_SYNAPSE_ROOT") or ""
        root_value = synapse_root or env_root or DEFAULT_SYNAPSE_ROOT
        self.synapse_root = Path(root_value)
        self.inbox = self.synapse_root / "inbox"
        self.outbox = self.synapse_root / "outbox"
        self.archive_outbox = self.synapse_root / "archive" / "outbox"

        self.timeout_s = float(
            timeout_s
            if timeout_s is not None
            else os.getenv("BIZRA_WINDOWS_SYNAPSE_TIMEOUT", DEFAULT_TIMEOUT_S)
        )
        self.poll_interval_s = float(
            poll_interval_s
            if poll_interval_s is not None
            else os.getenv("BIZRA_WINDOWS_SYNAPSE_POLL", DEFAULT_POLL_INTERVAL_S)
        )

        self.logger = logging.getLogger("windows_bridge")
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        self.inbox.mkdir(parents=True, exist_ok=True)
        self.outbox.mkdir(parents=True, exist_ok=True)
        self.archive_outbox.mkdir(parents=True, exist_ok=True)

    def _job_id(self) -> str:
        return f"win_{uuid.uuid4().hex[:8]}_{int(time.time())}"

    def _write_json(self, path: Path, payload: Dict[str, Any]) -> None:
        with path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)

    def _read_json(self, path: Path) -> Optional[Dict[str, Any]]:
        try:
            with path.open("r", encoding="utf-8") as handle:
                return json.load(handle)
        except Exception as exc:
            self.logger.warning("Failed reading %s: %s", path, exc)
            return None

    def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute Windows command via the synapse."""
        if not command:
            return {"status": "error", "error": "Empty command"}

        job_id = self._job_id()
        job = {
            "id": job_id,
            "command": command,
            "timestamp": time.time(),
            "source": "genesis",
        }

        job_file = self.inbox / f"{job_id}.json"
        try:
            self._write_json(job_file, job)
        except Exception as exc:
            return {"status": "error", "error": str(exc), "job_id": job_id}

        deadline = time.monotonic() + self.timeout_s
        receipt_file = self.outbox / f"{job_id}_receipt.json"
        while time.monotonic() < deadline:
            if receipt_file.exists():
                receipt = self._read_json(receipt_file)
                if receipt is None:
                    time.sleep(self.poll_interval_s)
                    continue

                try:
                    receipt_file.rename(self.archive_outbox / receipt_file.name)
                except Exception as exc:
                    self.logger.warning("Failed to archive receipt %s: %s", receipt_file, exc)
                return receipt

            time.sleep(self.poll_interval_s)

        return {
            "status": "timeout",
            "error": "Windows agent not responding",
            "job_id": job_id,
        }

    def health_check(self) -> Dict[str, Any]:
        """Check Windows agent health."""
        return self.execute_command("echo BIZRA Health Check")


__all__ = ["WindowsSynapseBridge"]
