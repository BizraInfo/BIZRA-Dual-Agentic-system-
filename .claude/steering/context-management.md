# Context Window Management Protocol

## Overview
Optimal use of agentic context window for BIZRA development.

## Context Hierarchy

### L1: Hot Context (Always Present)
- Current task definition
- Active file(s) being edited
- Immediate dependencies
- Error messages (if any)
- User's most recent instructions

### L2: Warm Context (Load on Demand)
- Related files in same module
- Test files for current code
- Recent commit history
- Design documents for current feature

### L3: Cold Context (Archive/Summarize)
- Historical decisions
- Completed tasks
- Reference documentation
- Pattern libraries

## Golden Condensation (phi = 1.618)

When context approaches limits, compress using golden ratio:
1. Keep phi^0 (100%) of L1 context
2. Keep phi^-1 (62%) of L2 context
3. Keep phi^-2 (38%) of L3 context
4. Archive remainder to memory.md

## Context Loading Strategy

### For Code Changes
```
1. Load target file (L1)
2. Load immediate imports (L1)
3. Load test file (L2)
4. Load design doc if complex (L2)
5. Summarize architecture context (L3)
```

### For Bug Fixes
```
1. Load error context (L1)
2. Load stack trace files (L1)
3. Load related tests (L2)
4. Load recent changes to affected code (L2)
5. Summarize historical fixes (L3)
```

### For New Features
```
1. Load spec documents (L1)
2. Load integration points (L1)
3. Load similar features (L2)
4. Load architecture overview (L2)
5. Summarize patterns library (L3)
```

## Memory Persistence

### Session Memory (memory.md)
- Update after significant decisions
- Record heuristics discovered
- Track active context
- Compress using golden condensation

### Long-Term Memory (CLAUDE.md)
- Project conventions
- Architecture decisions
- Hard requirements
- DO NOT modify during session

## SNR in Context

Maximize signal in context window:
- No duplicate information
- No outdated references
- Summarize verbose content
- Link to sources instead of embedding

## Context Refresh Triggers

Refresh context when:
1. Task changes significantly
2. Error indicates stale understanding
3. User corrects assumption
4. File system changes detected
5. 10+ turns without refresh
