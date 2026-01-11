"""
SynapseFrame - typed envelope for LLM outputs crossing the kernel boundary.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import hashlib
import json
import uuid


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_iso(ts: str) -> bool:
    try:
        datetime.fromisoformat(ts)
        return True
    except ValueError:
        return False


@dataclass(frozen=True)
class SynapseFrame:
    frame_id: str
    node_id: str
    intent: str
    content: str
    timestamp: str
    fate_signature: str
    zero_g_root: str
    context: Dict[str, Any] = field(default_factory=dict)
    ihsan_score: Optional[float] = None
    gini_coefficient: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @staticmethod
    def new(
        *,
        node_id: str,
        intent: str,
        content: str,
        fate_signature: str,
        zero_g_root: str,
        context: Optional[Dict[str, Any]] = None,
        ihsan_score: Optional[float] = None,
        gini_coefficient: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> "SynapseFrame":
        return SynapseFrame(
            frame_id=str(uuid.uuid4()),
            node_id=node_id,
            intent=intent,
            content=content,
            timestamp=_utc_now_iso(),
            fate_signature=fate_signature,
            zero_g_root=zero_g_root,
            context=context or {},
            ihsan_score=ihsan_score,
            gini_coefficient=gini_coefficient,
            metadata=metadata or {},
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "frame_id": self.frame_id,
            "node_id": self.node_id,
            "intent": self.intent,
            "content": self.content,
            "timestamp": self.timestamp,
            "fate_signature": self.fate_signature,
            "zero_g_root": self.zero_g_root,
            "context": self.context,
            "ihsan_score": self.ihsan_score,
            "gini_coefficient": self.gini_coefficient,
            "metadata": self.metadata,
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), sort_keys=True)

    def hash(self) -> str:
        return hashlib.sha256(self.to_json().encode()).hexdigest()

    @staticmethod
    def from_json(raw: str) -> "SynapseFrame":
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError(f"invalid_json: {exc}") from exc

        required = [
            "frame_id",
            "node_id",
            "intent",
            "content",
            "timestamp",
            "fate_signature",
            "zero_g_root",
        ]
        missing = [k for k in required if not payload.get(k)]
        if missing:
            raise ValueError(f"missing_fields: {', '.join(missing)}")

        return SynapseFrame(
            frame_id=str(payload["frame_id"]),
            node_id=str(payload["node_id"]),
            intent=str(payload["intent"]),
            content=str(payload["content"]),
            timestamp=str(payload["timestamp"]),
            fate_signature=str(payload["fate_signature"]),
            zero_g_root=str(payload["zero_g_root"]),
            context=payload.get("context") or {},
            ihsan_score=payload.get("ihsan_score"),
            gini_coefficient=payload.get("gini_coefficient"),
            metadata=payload.get("metadata") or {},
        )


@dataclass(frozen=True)
class SynapseVerification:
    verified: bool
    errors: List[str]


def verify_synapse_frame(
    frame: SynapseFrame,
    *,
    min_ihsan: float,
    max_gini: float,
    require_metrics: bool = True,
    require_signatures: bool = True,
) -> SynapseVerification:
    errors: List[str] = []

    if not frame.node_id.strip():
        errors.append("node_id_missing")
    if not frame.intent.strip():
        errors.append("intent_missing")
    if not frame.content.strip():
        errors.append("content_missing")
    if not _parse_iso(frame.timestamp):
        errors.append("timestamp_invalid")

    if require_signatures:
        if not frame.fate_signature.strip():
            errors.append("fate_signature_missing")
        if not frame.zero_g_root.strip():
            errors.append("zero_g_root_missing")

    if require_metrics:
        if frame.ihsan_score is None:
            errors.append("ihsan_score_missing")
        if frame.gini_coefficient is None:
            errors.append("gini_coefficient_missing")

    if frame.ihsan_score is not None and frame.ihsan_score < min_ihsan:
        errors.append("ihsan_below_threshold")
    if frame.gini_coefficient is not None and frame.gini_coefficient > max_gini:
        errors.append("gini_above_threshold")

    return SynapseVerification(verified=not errors, errors=errors)
