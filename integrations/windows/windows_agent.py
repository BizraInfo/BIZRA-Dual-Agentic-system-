#!/usr/bin/env python3
"""
BIZRA Windows Agent.
Run on Windows: python windows_agent.py
"""
from __future__ import annotations

import json
import os
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

DEFAULT_ROOT = r"C:\bizra_synapse"


def _synapse_root() -> Path:
    root = os.getenv("BIZRA_WINDOWS_SYNAPSE_ROOT") or DEFAULT_ROOT
    return Path(root)


def _ensure_dirs(root: Path) -> Dict[str, Path]:
    inbox = root / "inbox"
    outbox = root / "outbox"
    logs = root / "logs"
    archive = root / "archive"
    inbox.mkdir(parents=True, exist_ok=True)
    outbox.mkdir(parents=True, exist_ok=True)
    logs.mkdir(parents=True, exist_ok=True)
    archive.mkdir(parents=True, exist_ok=True)
    return {"root": root, "inbox": inbox, "outbox": outbox, "logs": logs, "archive": archive}


def _read_json(path: Path) -> Optional[Dict[str, Any]]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return None


def _write_json(path: Path, payload: Dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def _calculate_ihsan(output: str, returncode: int) -> float:
    score = 0.5
    if returncode == 0:
        score += 0.3
    if output and "error" not in output.lower():
        score += 0.1
    if "success" in output.lower() or "completed" in output.lower():
        score += 0.1
    return min(score, 1.0)


def _archive_job(job_file: Path, archive_root: Path) -> None:
    date_dir = archive_root / "inbox" / datetime.now().strftime("%Y%m%d")
    date_dir.mkdir(parents=True, exist_ok=True)
    job_file.rename(date_dir / job_file.name)


def _handle_job(job_file: Path, outbox: Path, archive_root: Path) -> None:
    job = _read_json(job_file)
    job_id = job.get("id") if isinstance(job, dict) else job_file.stem
    command = job.get("command", "") if isinstance(job, dict) else ""

    if not command:
        receipt = {
            "job_id": job_id,
            "command": command,
            "output": "",
            "error": "Missing command",
            "returncode": 1,
            "ihsan_score": 0.0,
            "timestamp": time.time(),
            "status": "error",
        }
        _write_json(outbox / f"{job_id}_receipt.json", receipt)
        _archive_job(job_file, archive_root)
        return

    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        timeout=60,
    )

    ihsan = _calculate_ihsan(result.stdout, result.returncode)
    receipt = {
        "job_id": job_id,
        "command": command,
        "output": result.stdout,
        "error": result.stderr if result.stderr else None,
        "returncode": result.returncode,
        "ihsan_score": ihsan,
        "timestamp": time.time(),
    }
    _write_json(outbox / f"{job_id}_receipt.json", receipt)
    _archive_job(job_file, archive_root)


def main() -> None:
    paths = _ensure_dirs(_synapse_root())
    print("=" * 60)
    print("BIZRA WINDOWS AGENT")
    print("=" * 60)
    print(f"Started: {datetime.now()}")
    print(f"Watching: {paths['inbox']}")
    print("=" * 60)

    processed = 0
    try:
        while True:
            for job_file in paths["inbox"].glob("*.json"):
                try:
                    _handle_job(job_file, paths["outbox"], paths["archive"])
                    processed += 1
                except Exception as exc:
                    receipt = {
                        "job_id": job_file.stem,
                        "command": "",
                        "output": "",
                        "error": str(exc),
                        "returncode": 1,
                        "ihsan_score": 0.0,
                        "timestamp": time.time(),
                        "status": "error",
                    }
                    _write_json(paths["outbox"] / f"{job_file.stem}_receipt.json", receipt)
                    _archive_job(job_file, paths["archive"])
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"Agent stopped. Processed {processed} jobs.")


if __name__ == "__main__":
    main()
