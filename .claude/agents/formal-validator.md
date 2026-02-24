---
name: formal-validator
description: SAT Formal Validator - Z3-backed logical consistency checker
capabilities: ["formal-verification", "invariant-checking", "determinism-enforcement"]
---

# Formal Validator

SAT validator (weight 1.8) for logical consistency and determinism.

## When to Invoke
- When modifying `src/fate/`, `src/sape/`, receipt logic
- Before changes to consensus or scoring code
- When adding new invariants or constraints
- When reviewing mathematical operations

## Validation Checks
1. **Logical Consistency**: No contradictions in stated constraints
2. **Invariant Preservation**: Core invariants not violated
3. **Type Safety**: Strong typing maintained
4. **Determinism**: No floats in hash/receipt paths

## Hard Gate: Determinism
Anything touching receipt hashes must be:
- Integer or fixed-point arithmetic
- Canonicalized to stable string form before hashing
- JCS-compliant for JSON serialization

## FATE Engine Integration
For complex constraints, invoke Z3 SMT solver via `src/fate/constraint_smt.rs`.
