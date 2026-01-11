#!/usr/bin/env python3
"""
BIZRA Graph-of-Thoughts (GoT) Engine — Non-Linear Cognitive Architecture

Implements the advanced reasoning topology for DDAGI:
- Arbitrary directed graph structure (not linear CoT)
- Aggregation: Merge independent thought paths
- Looping: Iterative refinement via verification feedback
- Pruning: SNR-guided dead-end elimination

DNA Signature: 7-3-6-9-∞
Covenant: Ihsān (إحسان)
"""

from __future__ import annotations

import hashlib
import heapq
import json
import math
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum, auto
from typing import (
    Any, Callable, Dict, Generic, List, 
    Optional, Set, Tuple, TypeVar, Union
)
from collections import defaultdict
import random


# ============================================
# THOUGHT TYPES
# ============================================

class ThoughtType(Enum):
    """Types of thoughts in the GoT graph"""
    ROOT = "root"           # Initial query/problem
    DIVERGE = "diverge"     # Exploration branch
    CONVERGE = "converge"   # Synthesis node
    VERIFY = "verify"       # FATE verification checkpoint
    AGGREGATE = "aggregate" # Multi-path merger
    REFINE = "refine"       # Loop iteration
    TERMINAL = "terminal"   # Final answer


class ThoughtStatus(Enum):
    """Status of thought node"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETE = "complete"
    PRUNED = "pruned"
    VERIFIED = "verified"
    FAILED = "failed"


class EdgeType(Enum):
    """Types of edges in thought graph"""
    DERIVES = "derives"       # Logical derivation
    AGGREGATES = "aggregates" # Combines multiple thoughts
    REFINES = "refines"       # Iterative improvement
    VERIFIES = "verifies"     # FATE verification link
    CONTRADICTS = "contradicts" # Conflict edge


# ============================================
# THOUGHT NODE
# ============================================

@dataclass
class ThoughtNode:
    """
    Node in the Graph-of-Thoughts
    
    Represents a single "thought" with:
    - Content (the actual reasoning)
    - Provenance (parent links)
    - Metrics (SNR, Ihsān scores)
    """
    
    node_id: str
    thought_type: ThoughtType
    content: str
    
    # Graph structure
    parents: List[str] = field(default_factory=list)
    children: List[str] = field(default_factory=list)
    
    # Metrics
    snr_score: float = 0.0      # Signal-to-Noise Ratio
    ihsan_score: float = 0.0    # Ethical alignment
    confidence: float = 0.0     # Epistemic confidence
    depth: int = 0              # Distance from root
    
    # Status
    status: ThoughtStatus = ThoughtStatus.PENDING
    
    # Metadata
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def composite_score(self) -> float:
        """Compute composite score: SNR × Ihsān × Confidence"""
        return self.snr_score * self.ihsan_score * self.confidence
    
    def hash(self) -> str:
        """Compute content hash"""
        return hashlib.sha256(self.content.encode()).hexdigest()[:16]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "type": self.thought_type.value,
            "content": self.content[:100] + "..." if len(self.content) > 100 else self.content,
            "parents": self.parents,
            "children": self.children,
            "scores": {
                "snr": self.snr_score,
                "ihsan": self.ihsan_score,
                "confidence": self.confidence,
                "composite": self.composite_score
            },
            "status": self.status.value,
            "depth": self.depth
        }


@dataclass
class ThoughtEdge:
    """Edge connecting two thought nodes"""
    
    source_id: str
    target_id: str
    edge_type: EdgeType
    weight: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)


# ============================================
# GRAPH-OF-THOUGHTS ENGINE
# ============================================

class GraphOfThoughts:
    """
    Graph-of-Thoughts (GoT) Cognitive Engine
    
    Unlike linear Chain-of-Thought (CoT), GoT models reasoning
    as an arbitrary directed graph where:
    - Vertices are "thoughts"
    - Edges are dependencies/derivations
    
    Key operations:
    - Aggregation: Merge independent paths
    - Looping: Iterative refinement
    - Pruning: Dead-end elimination
    """
    
    # Pruning threshold
    MIN_COMPOSITE_SCORE = 0.3
    
    # Maximum graph depth
    MAX_DEPTH = 15
    
    # Beam width for parallel exploration
    BEAM_WIDTH = 7
    
    def __init__(self):
        self.nodes: Dict[str, ThoughtNode] = {}
        self.edges: List[ThoughtEdge] = []
        self.root_id: Optional[str] = None
        self.terminal_ids: List[str] = []
        
        # Metrics
        self.nodes_created = 0
        self.nodes_pruned = 0
        self.aggregations = 0
        self.refinement_loops = 0
    
    def create_root(self, query: str) -> ThoughtNode:
        """Create root thought from initial query"""
        
        node_id = f"ROOT_{int(time.time()*1000)}"
        
        node = ThoughtNode(
            node_id=node_id,
            thought_type=ThoughtType.ROOT,
            content=query,
            snr_score=1.0,
            ihsan_score=1.0,
            confidence=1.0,
            depth=0,
            status=ThoughtStatus.COMPLETE
        )
        
        self.nodes[node_id] = node
        self.root_id = node_id
        self.nodes_created += 1
        
        return node
    
    def add_thought(
        self,
        content: str,
        thought_type: ThoughtType,
        parent_ids: List[str],
        snr_score: float = 0.5,
        ihsan_score: float = 0.95,
        confidence: float = 0.5,
        metadata: Optional[Dict] = None
    ) -> Optional[ThoughtNode]:
        """
        Add a new thought node to the graph
        
        Returns None if the thought is immediately pruned.
        """
        
        # Validate parents exist
        for pid in parent_ids:
            if pid not in self.nodes:
                raise ValueError(f"Parent node {pid} not found")
        
        # Calculate depth
        max_parent_depth = max(
            self.nodes[pid].depth for pid in parent_ids
        ) if parent_ids else 0
        depth = max_parent_depth + 1
        
        # Check depth limit
        if depth > self.MAX_DEPTH:
            return None
        
        # Generate node ID
        node_id = f"{thought_type.value.upper()}_{int(time.time()*1000)}_{self.nodes_created}"
        
        # Create node
        node = ThoughtNode(
            node_id=node_id,
            thought_type=thought_type,
            content=content,
            parents=parent_ids,
            snr_score=snr_score,
            ihsan_score=ihsan_score,
            confidence=confidence,
            depth=depth,
            status=ThoughtStatus.PENDING,
            metadata=metadata or {}
        )
        
        # Check if should be pruned
        if node.composite_score < self.MIN_COMPOSITE_SCORE:
            node.status = ThoughtStatus.PRUNED
            self.nodes_pruned += 1
            # Still add to graph for provenance, but mark as pruned
        
        # Add to graph
        self.nodes[node_id] = node
        self.nodes_created += 1
        
        # Create edges from parents
        for pid in parent_ids:
            edge_type = EdgeType.DERIVES
            if thought_type == ThoughtType.AGGREGATE:
                edge_type = EdgeType.AGGREGATES
            elif thought_type == ThoughtType.REFINE:
                edge_type = EdgeType.REFINES
            elif thought_type == ThoughtType.VERIFY:
                edge_type = EdgeType.VERIFIES
            
            edge = ThoughtEdge(
                source_id=pid,
                target_id=node_id,
                edge_type=edge_type,
                weight=node.composite_score
            )
            self.edges.append(edge)
            
            # Update parent's children
            self.nodes[pid].children.append(node_id)
        
        return node
    
    def diverge(
        self,
        parent_id: str,
        num_branches: int = 3,
        generator: Optional[Callable[[str], List[str]]] = None
    ) -> List[ThoughtNode]:
        """
        Diverge: Generate multiple exploration branches from a node
        
        This is the "brainstorming" phase where we explore
        different solution paths in parallel.
        """
        
        parent = self.nodes.get(parent_id)
        if not parent:
            raise ValueError(f"Parent node {parent_id} not found")
        
        branches = []
        
        # Generate branch contents
        if generator:
            contents = generator(parent.content)
        else:
            # Default: simple variations
            contents = [
                f"Approach {i+1}: Exploring variation of '{parent.content[:50]}...'"
                for i in range(num_branches)
            ]
        
        for i, content in enumerate(contents[:num_branches]):
            # Vary scores slightly for diversity
            snr = max(0.3, min(1.0, parent.snr_score * (0.8 + random.random() * 0.4)))
            ihsan = max(0.9, parent.ihsan_score)  # Maintain high ethical bar
            conf = max(0.2, parent.confidence * (0.7 + random.random() * 0.3))
            
            node = self.add_thought(
                content=content,
                thought_type=ThoughtType.DIVERGE,
                parent_ids=[parent_id],
                snr_score=snr,
                ihsan_score=ihsan,
                confidence=conf,
                metadata={"branch_index": i}
            )
            
            if node and node.status != ThoughtStatus.PRUNED:
                node.status = ThoughtStatus.ACTIVE
                branches.append(node)
        
        return branches
    
    def converge(
        self,
        node_ids: List[str],
        synthesizer: Optional[Callable[[List[str]], str]] = None
    ) -> Optional[ThoughtNode]:
        """
        Converge: Synthesize multiple paths into single conclusion
        
        Uses SNR × Ihsān scoring to select the optimal path.
        """
        
        if not node_ids:
            return None
        
        # Get nodes
        nodes = [self.nodes[nid] for nid in node_ids if nid in self.nodes]
        if not nodes:
            return None
        
        # Filter out pruned nodes
        active_nodes = [n for n in nodes if n.status != ThoughtStatus.PRUNED]
        if not active_nodes:
            return None
        
        # Find optimal path: max(SNR × Ihsān)
        optimal = max(active_nodes, key=lambda n: n.composite_score)
        
        # Generate synthesis
        if synthesizer:
            content = synthesizer([n.content for n in active_nodes])
        else:
            content = f"Synthesis: Selected optimal path from {len(active_nodes)} candidates. " \
                      f"Best: {optimal.content[:100]}..."
        
        # Compute aggregated scores
        avg_snr = sum(n.snr_score for n in active_nodes) / len(active_nodes)
        max_ihsan = max(n.ihsan_score for n in active_nodes)
        avg_conf = sum(n.confidence for n in active_nodes) / len(active_nodes)
        
        node = self.add_thought(
            content=content,
            thought_type=ThoughtType.CONVERGE,
            parent_ids=[n.node_id for n in active_nodes],
            snr_score=max(avg_snr, optimal.snr_score),
            ihsan_score=max_ihsan,
            confidence=avg_conf * 1.1,  # Boost from consensus
            metadata={"optimal_path": optimal.node_id}
        )
        
        if node:
            node.status = ThoughtStatus.COMPLETE
        
        return node
    
    def aggregate(
        self,
        node_ids: List[str],
        aggregator: Optional[Callable[[List[str]], str]] = None
    ) -> Optional[ThoughtNode]:
        """
        Aggregate: Merge independent thought paths
        
        Unlike convergence (which selects best), aggregation
        combines insights from multiple paths.
        """
        
        if len(node_ids) < 2:
            return None
        
        nodes = [self.nodes[nid] for nid in node_ids if nid in self.nodes]
        active_nodes = [n for n in nodes if n.status != ThoughtStatus.PRUNED]
        
        if len(active_nodes) < 2:
            return None
        
        # Generate aggregation
        if aggregator:
            content = aggregator([n.content for n in active_nodes])
        else:
            content = f"Aggregation: Combining {len(active_nodes)} independent insights. " \
                      f"Sources: {[n.node_id for n in active_nodes]}"
        
        # Aggregated scores boost each other
        combined_snr = min(1.0, sum(n.snr_score for n in active_nodes) / len(active_nodes) * 1.2)
        combined_ihsan = min(n.ihsan_score for n in active_nodes)  # Conservative on ethics
        combined_conf = min(1.0, sum(n.confidence for n in active_nodes) / len(active_nodes) * 1.15)
        
        node = self.add_thought(
            content=content,
            thought_type=ThoughtType.AGGREGATE,
            parent_ids=[n.node_id for n in active_nodes],
            snr_score=combined_snr,
            ihsan_score=combined_ihsan,
            confidence=combined_conf,
            metadata={"aggregated_count": len(active_nodes)}
        )
        
        if node:
            self.aggregations += 1
            node.status = ThoughtStatus.COMPLETE
        
        return node
    
    def refine(
        self,
        node_id: str,
        feedback: str,
        refiner: Optional[Callable[[str, str], str]] = None
    ) -> Optional[ThoughtNode]:
        """
        Refine: Iteratively improve a thought based on feedback
        
        This implements the "looping" capability of GoT.
        """
        
        node = self.nodes.get(node_id)
        if not node:
            return None
        
        # Generate refinement
        if refiner:
            content = refiner(node.content, feedback)
        else:
            content = f"Refinement of {node_id}: {node.content[:50]}... " \
                      f"[Feedback: {feedback[:50]}...]"
        
        # Refinement typically improves scores
        refined = self.add_thought(
            content=content,
            thought_type=ThoughtType.REFINE,
            parent_ids=[node_id],
            snr_score=min(1.0, node.snr_score * 1.1),
            ihsan_score=node.ihsan_score,
            confidence=min(1.0, node.confidence * 1.15),
            metadata={"feedback": feedback, "iteration": node.metadata.get("iteration", 0) + 1}
        )
        
        if refined:
            self.refinement_loops += 1
            refined.status = ThoughtStatus.ACTIVE
        
        return refined
    
    def verify(
        self,
        node_id: str,
        ihsan_threshold: float = 0.95
    ) -> Tuple[bool, Optional[ThoughtNode]]:
        """
        Verify: FATE verification checkpoint
        
        Returns (passed, verification_node)
        """
        
        node = self.nodes.get(node_id)
        if not node:
            return (False, None)
        
        # Check Ihsān threshold
        passed = node.ihsan_score >= ihsan_threshold
        
        verification = self.add_thought(
            content=f"FATE Verification: {'PASSED' if passed else 'FAILED'}. " \
                    f"Ihsān={node.ihsan_score:.4f}, Threshold={ihsan_threshold}",
            thought_type=ThoughtType.VERIFY,
            parent_ids=[node_id],
            snr_score=1.0 if passed else 0.0,
            ihsan_score=node.ihsan_score,
            confidence=1.0 if passed else 0.3,
            metadata={"verified": passed, "threshold": ihsan_threshold}
        )
        
        if verification:
            verification.status = ThoughtStatus.VERIFIED if passed else ThoughtStatus.FAILED
        
        return (passed, verification)
    
    def terminate(
        self,
        node_id: str,
        final_answer: Optional[str] = None
    ) -> ThoughtNode:
        """Create terminal node (final answer)"""
        
        node = self.nodes.get(node_id)
        if not node:
            raise ValueError(f"Node {node_id} not found")
        
        content = final_answer or f"Final Answer: {node.content}"
        
        terminal = self.add_thought(
            content=content,
            thought_type=ThoughtType.TERMINAL,
            parent_ids=[node_id],
            snr_score=node.snr_score,
            ihsan_score=node.ihsan_score,
            confidence=node.confidence,
            metadata={"source_node": node_id}
        )
        
        if terminal:
            terminal.status = ThoughtStatus.COMPLETE
            self.terminal_ids.append(terminal.node_id)
        
        return terminal
    
    def prune_low_quality(self, threshold: Optional[float] = None) -> int:
        """Prune all nodes below quality threshold"""
        
        threshold = threshold or self.MIN_COMPOSITE_SCORE
        pruned_count = 0
        
        for node in self.nodes.values():
            if node.status not in [ThoughtStatus.PRUNED, ThoughtStatus.VERIFIED]:
                if node.composite_score < threshold:
                    node.status = ThoughtStatus.PRUNED
                    pruned_count += 1
        
        self.nodes_pruned += pruned_count
        return pruned_count
    
    def get_best_path(self) -> List[ThoughtNode]:
        """Get the highest-scoring path from root to terminal"""
        
        if not self.terminal_ids:
            return []
        
        # Find best terminal
        terminals = [self.nodes[tid] for tid in self.terminal_ids]
        best_terminal = max(terminals, key=lambda n: n.composite_score)
        
        # Trace back to root
        path = [best_terminal]
        current = best_terminal
        
        while current.parents:
            # Choose best parent
            parent_nodes = [self.nodes[pid] for pid in current.parents]
            best_parent = max(parent_nodes, key=lambda n: n.composite_score)
            path.append(best_parent)
            current = best_parent
        
        return list(reversed(path))
    
    def get_stats(self) -> Dict[str, Any]:
        """Get graph statistics"""
        
        status_counts = defaultdict(int)
        type_counts = defaultdict(int)
        
        for node in self.nodes.values():
            status_counts[node.status.value] += 1
            type_counts[node.thought_type.value] += 1
        
        return {
            "total_nodes": len(self.nodes),
            "total_edges": len(self.edges),
            "nodes_created": self.nodes_created,
            "nodes_pruned": self.nodes_pruned,
            "aggregations": self.aggregations,
            "refinement_loops": self.refinement_loops,
            "terminals": len(self.terminal_ids),
            "max_depth": max((n.depth for n in self.nodes.values()), default=0),
            "status_distribution": dict(status_counts),
            "type_distribution": dict(type_counts)
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Export graph as dictionary"""
        
        return {
            "root_id": self.root_id,
            "terminal_ids": self.terminal_ids,
            "nodes": {nid: n.to_dict() for nid, n in self.nodes.items()},
            "edges": [
                {
                    "source": e.source_id,
                    "target": e.target_id,
                    "type": e.edge_type.value,
                    "weight": e.weight
                }
                for e in self.edges
            ],
            "stats": self.get_stats()
        }


# ============================================
# GoT SOLVER
# ============================================

class GoTSolver:
    """
    Graph-of-Thoughts Solver
    
    Orchestrates the GoT reasoning process:
    1. Create root from query
    2. Diverge into exploration branches
    3. Process each branch (with potential sub-branches)
    4. Converge/Aggregate results
    5. Verify via FATE
    6. Refine if needed
    7. Terminate with final answer
    """
    
    def __init__(
        self,
        beam_width: int = 7,
        max_depth: int = 10,
        ihsan_threshold: float = 0.95
    ):
        self.beam_width = beam_width
        self.max_depth = max_depth
        self.ihsan_threshold = ihsan_threshold
    
    def solve(
        self,
        query: str,
        thought_generator: Optional[Callable[[str], List[str]]] = None,
        synthesizer: Optional[Callable[[List[str]], str]] = None,
        max_iterations: int = 5
    ) -> Dict[str, Any]:
        """
        Solve a query using Graph-of-Thoughts
        
        Returns solution with full reasoning trace.
        """
        
        start_time = time.time()
        
        # Initialize graph
        got = GraphOfThoughts()
        got.BEAM_WIDTH = self.beam_width
        got.MAX_DEPTH = self.max_depth
        
        # Create root
        root = got.create_root(query)
        
        # Phase 1: Diverge - Generate exploration branches
        branches = got.diverge(
            parent_id=root.node_id,
            num_branches=self.beam_width,
            generator=thought_generator
        )
        
        # Phase 2: Process branches (potentially with sub-divergence)
        active_nodes = branches.copy()
        iteration = 0
        
        while active_nodes and iteration < max_iterations:
            iteration += 1
            
            # For each active node, potentially diverge further
            next_active = []
            for node in active_nodes:
                if node.depth < self.max_depth // 2:
                    # Sub-diverge
                    sub_branches = got.diverge(
                        parent_id=node.node_id,
                        num_branches=3,
                        generator=thought_generator
                    )
                    next_active.extend(sub_branches)
                else:
                    next_active.append(node)
            
            active_nodes = next_active
            
            # Prune low-quality paths
            got.prune_low_quality()
        
        # Phase 3: Converge - Find optimal paths
        active_ids = [
            nid for nid, n in got.nodes.items()
            if n.status == ThoughtStatus.ACTIVE or n.status == ThoughtStatus.COMPLETE
        ]
        
        if active_ids:
            converged = got.converge(
                node_ids=active_ids,
                synthesizer=synthesizer
            )
        else:
            converged = root
        
        # Phase 4: Verify via FATE
        if converged:
            passed, verification = got.verify(
                node_id=converged.node_id,
                ihsan_threshold=self.ihsan_threshold
            )
            
            # Phase 5: Refine if verification failed
            if not passed and verification:
                refined = got.refine(
                    node_id=converged.node_id,
                    feedback=f"Ihsān score {converged.ihsan_score:.4f} below threshold {self.ihsan_threshold}"
                )
                if refined:
                    # Re-verify
                    passed, verification = got.verify(
                        node_id=refined.node_id,
                        ihsan_threshold=self.ihsan_threshold
                    )
                    converged = refined
        
        # Phase 6: Terminate
        final_node = got.terminate(
            node_id=converged.node_id if converged else root.node_id,
            final_answer=f"Solution for: {query[:100]}... [Verified: {passed if 'passed' in dir() else 'N/A'}]"
        )
        
        # Get best path
        best_path = got.get_best_path()
        
        elapsed_time = time.time() - start_time
        
        return {
            "query": query,
            "solution": final_node.content if final_node else "No solution found",
            "verified": passed if 'passed' in dir() else False,
            "best_path": [n.to_dict() for n in best_path],
            "graph": got.to_dict(),
            "stats": {
                **got.get_stats(),
                "iterations": iteration,
                "elapsed_time_ms": elapsed_time * 1000
            }
        }


# ============================================
# MAIN EXECUTION
# ============================================

def main():
    """Demonstrate Graph-of-Thoughts reasoning"""
    
    print("="*72)
    print("🧠 BIZRA GRAPH-OF-THOUGHTS (GoT) ENGINE")
    print("="*72)
    print("   Architecture: Non-Linear Cognitive Graph")
    print("   Operations: Aggregation | Looping | Pruning")
    print("   Covenant: Ihsān (إحسان)")
    print("="*72)
    
    # Create solver
    solver = GoTSolver(
        beam_width=5,
        max_depth=8,
        ihsan_threshold=0.95
    )
    
    # Solve a complex query
    query = "Design a verification system that ensures AI outputs are truthful, " \
            "beneficial, and align with ethical constraints while maintaining high performance."
    
    print(f"\n📝 QUERY: {query[:70]}...")
    print("\n🔄 SOLVING WITH GRAPH-OF-THOUGHTS...")
    
    # Custom thought generator
    def thought_generator(context: str) -> List[str]:
        approaches = [
            "Formal verification approach: Use Z3 SMT solver for logical consistency",
            "Statistical approach: Conformal prediction for uncertainty quantification",
            "Adversarial approach: Red team probing for robustness testing",
            "Ethical approach: Ihsān vector scoring for alignment verification",
            "Hybrid approach: Combine formal and statistical methods",
        ]
        return approaches
    
    result = solver.solve(
        query=query,
        thought_generator=thought_generator,
        max_iterations=3
    )
    
    # Display results
    print(f"\n✅ SOLUTION FOUND:")
    print(f"   Verified: {'✅ YES' if result['verified'] else '⚠️ NO'}")
    print(f"   Content: {result['solution'][:100]}...")
    
    print(f"\n📊 GRAPH STATISTICS:")
    stats = result['stats']
    print(f"   Total Nodes: {stats['total_nodes']}")
    print(f"   Total Edges: {stats['total_edges']}")
    print(f"   Nodes Pruned: {stats['nodes_pruned']}")
    print(f"   Aggregations: {stats['aggregations']}")
    print(f"   Refinement Loops: {stats['refinement_loops']}")
    print(f"   Max Depth: {stats['max_depth']}")
    print(f"   Elapsed Time: {stats['elapsed_time_ms']:.2f}ms")
    
    print(f"\n🛤️ BEST PATH ({len(result['best_path'])} nodes):")
    for i, node in enumerate(result['best_path']):
        icon = "🟢" if node['status'] in ['complete', 'verified'] else "🟡"
        print(f"   {icon} [{i+1}] {node['type']}: {node['content'][:50]}...")
        print(f"       Scores: SNR={node['scores']['snr']:.2f}, Ihsān={node['scores']['ihsan']:.2f}")
    
    # Save graph
    from pathlib import Path
    graph_path = Path(__file__).parent.parent / "GOT_REASONING_TRACE.json"
    with open(graph_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n📁 Reasoning trace saved: {graph_path}")
    
    print("\n" + "="*72)
    print("🏆 GRAPH-OF-THOUGHTS: OPERATIONAL")
    print("="*72)


if __name__ == "__main__":
    main()
