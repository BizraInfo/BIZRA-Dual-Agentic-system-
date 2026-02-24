# Multi-Agent Orchestration Patterns

## Overview
Patterns for coordinating multiple agents in BIZRA development workflows.

## Pattern 1: Parallel Research

**Use When**: Multiple independent information needs

```
Main Thread
    |
    +---> Agent 1: Research topic A
    +---> Agent 2: Research topic B
    +---> Agent 3: Research topic C
    |
    +<--- Merge results
    |
    v
Continue with synthesis
```

**Example**: Understanding a bug across multiple components
```
Agent 1 (Explore): Find error handling in module X
Agent 2 (Explore): Find related tests
Agent 3 (Explore): Find recent changes
```

## Pattern 2: Tree Evaluation (from KFC)

**Use When**: Multiple competing outputs need judging

```
Round 1: N outputs
    |
    +---> Judge 1: Evaluate docs 1-4 -> Best of group
    +---> Judge 2: Evaluate docs 5-8 -> Best of group
    +---> Judge 3: Evaluate docs 9-12 -> Best of group
    |
Round 2: 3 outputs
    |
    +---> Final Judge: Select winner
    |
    v
Rename winner to standard name
```

**Constraint**: Each judge evaluates max 4 documents

## Pattern 3: PAT Synthesis

**Use When**: Need comprehensive multi-perspective analysis

```
Main Thread: Problem statement
    |
    +---> Perspective 1: Strategic (async optional)
    +---> Perspective 2: Creative (async optional)
    +---> Perspective 3: Analytical (async optional)
    +---> Perspective 4: Implementation (async optional)
    +---> Perspective 5: Quality (async optional)
    +---> Perspective 6: User (async optional)
    +---> Perspective 7: Integration (async optional)
    |
    +<--- Synthesize all perspectives
    |
    v
Unified recommendation
```

## Pattern 4: SAT Validation Chain

**Use When**: Critical code needs full validation

```
Artifact
    |
    v
Security Sentinel ----VETO?----> BLOCKED
    |
    v (pass)
Formal Validator
    |
    v
Ethics Guardian ------VETO?----> BLOCKED
    |
    v (pass)
Resource Guardian
    |
    v
Context Validator
    |
    v
Consensus: 3/5 required
    |
    v
APPROVED or REJECTED
```

## Pattern 5: Dependency-Aware Execution

**Use When**: Tasks have interdependencies

```
Given dependency graph:
    T1 --> T2.1
    T1 --> T2.2
    T3 --> T4
    T2.1 --> T4
    T2.2 --> T4

Execution:
    Wave 1: [T1, T3] in parallel
    Wave 2: [T2.1, T2.2] in parallel (after T1)
    Wave 3: [T4] (after T2.1, T2.2, T3)
```

## Pattern 6: Giants Protocol Synthesis

**Use When**: Need interdisciplinary grounding

```
Problem
    |
    +---> Beam 1: Consensus path
    +---> Beam 2: Contrarian path
    +---> Beam 3: Primordial path
    |
    +<--- SNR scoring each beam
    |
    v
Select highest SNR beam
    |
    v
SAPE conscience check
    |
    v
Final synthesis
```

## Anti-Patterns

### 1. Sequential When Parallel Possible
**Bad**: Running independent searches one by one
**Good**: Launch all independent searches simultaneously

### 2. Parallel When Dependencies Exist
**Bad**: Starting dependent task before prerequisite completes
**Good**: Analyze dependency graph, execute in waves

### 3. Over-Parallelization
**Bad**: 128 agents for simple task
**Good**: Match agent count to task complexity

### 4. Missing Synthesis
**Bad**: Parallel results left unintegrated
**Good**: Always merge/synthesize parallel outputs

### 5. Skipping Validation
**Bad**: Deploying without SAT check
**Good**: Always run validation before completion
