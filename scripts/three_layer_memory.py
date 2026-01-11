#!/usr/bin/env python3
"""
BIZRA 3-Layer Memory System — AgentFold High-Performance Context

Architecture:
- L-HOT (Active): Session context, high speed (Dict/RAM)
- L-WARM (Episodic): 30-day context, indexed (Redis/JSON State)
- L-COLD (Knowledge): Immutable permanent knowledge (PG/DA Layer)

Optimization: AgentFold φ-condensation (Golden Ratio retention)
Covenant: Ihsān | Motto: "Excellence in persistence."
"""

import json
import hashlib
import time
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple

@dataclass
class MemoryNode:
    """A single unit of memory with metadata."""
    content: Any
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    importance: float = 1.0
    access_count: int = 0
    
    def hash(self) -> str:
        data = f"{self.content}{json.dumps(self.metadata, sort_keys=True)}"
        return hashlib.sha256(data.encode()).hexdigest()

class ThreeLayerMemory:
    """
    Cognitive Memory Stack with 3-Layer Hierarchical Storage
    """
    
    PHI = 1.6180339887  # Golden Ratio
    CONDENSATION_RATIO = 1 / PHI  # ≈ 0.618
    
    def __init__(self, persistence_root: Optional[Path] = None):
        self.root = persistence_root or Path("/root/bizra-genesis/memory")
        self.root.mkdir(parents=True, exist_ok=True)
        
        # In-memory stack (L-HOT)
        self.l_hot: Dict[str, MemoryNode] = {}
        
        # Ephemeral persistent cache (L-WARM)
        self.warm_path = self.root / "l_warm.json"
        self.l_warm: Dict[str, MemoryNode] = self._load_warm()
        
        # Permanent vector/knowledge (L-COLD) - Simulation
        self.cold_path = self.root / "l_cold.jsonl"
        
    def store(self, content: Any, importance: float = 1.0, metadata: Optional[Dict] = None):
        """Store content in L-HOT and trigger condensation checks."""
        node = MemoryNode(content=content, importance=importance, metadata=metadata or {})
        node_hash = node.hash()
        
        self.l_hot[node_hash] = node
        
        # Condensation trigger (Auto-AgentFold)
        if len(self.l_hot) > 13: # Fibonacci sequence trigger
            self._condense_to_warm()

    def retrieve(self, query: str, top_k: int = 3) -> List[MemoryNode]:
        """Hierarchical retrieval: HOT -> WARM -> COLD."""
        results = []
        
        # Search HOT
        for node in self.l_hot.values():
            if self._matches(query, node):
                results.append(node)
                node.access_count += 1
                
        # Search WARM if not enough in HOT
        if len(results) < top_k:
            for node in self.l_warm.values():
                if self._matches(query, node):
                    results.append(node)
                    node.access_count += 1
                    
        return results[:top_k]

    def _matches(self, query: str, node: MemoryNode) -> bool:
        """Simple string/metadata matching logic."""
        q = query.lower()
        if isinstance(node.content, str) and q in node.content.lower():
            return True
        if q in json.dumps(node.metadata).lower():
            return True
        return False

    def _condense_to_warm(self):
        """Perform AgentFold phi-condensation from HOT to WARM."""
        print(f"🌀 Condensing L-HOT memory (Size: {len(self.l_hot)})...")
        
        # Sort by importance and access count
        all_items = list(self.l_hot.items())
        all_items.sort(key=lambda x: x[1].importance * (x[1].access_count + 1), reverse=True)
        
        # Keep 61.8% of items
        retention_count = int(len(all_items) * self.CONDENSATION_RATIO)
        retained = all_items[:retention_count]
        discarded = all_items[retention_count:]
        
        # Move retained to WARM
        for key, node in retained:
            self.l_warm[key] = node
            
        # Move discarded to COLD (Archive)
        self._archive_to_cold([node for _, node in discarded])
        
        # Reset L-HOT
        self.l_hot.clear()
        self._save_warm()
        print(f"✅ Condensation complete. Retained: {retention_count}, Archived: {len(discarded)}")

    def _archive_to_cold(self, nodes: List[MemoryNode]):
        """Append nodes to immutable L-COLD ledger."""
        with open(self.cold_path, "a") as f:
            for node in nodes:
                f.write(json.dumps({
                    "h": node.hash(),
                    "c": node.content,
                    "t": node.timestamp,
                    "m": node.metadata
                }) + "\n")

    def _load_warm(self) -> Dict[str, MemoryNode]:
        if not self.warm_path.exists(): return {}
        try:
            with open(self.warm_path, "r") as f:
                data = json.load(f)
                return {k: MemoryNode(**v) for k, v in data.items()}
        except: return {}

    def _save_warm(self):
        with open(self.warm_path, "w") as f:
            data = {k: {
                "content": v.content,
                "metadata": v.metadata,
                "timestamp": v.timestamp,
                "importance": v.importance,
                "access_count": v.access_count
            } for k, v in self.l_warm.items()}
            json.dump(data, f, indent=2)

if __name__ == "__main__":
    mem = ThreeLayerMemory()
    for i in range(20):
        mem.store(f"Knowledge Piece {i}", importance=random.random())
    print(f"WARM memory entries: {len(mem.l_warm)}")
