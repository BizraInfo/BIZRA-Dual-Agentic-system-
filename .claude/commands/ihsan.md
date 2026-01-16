# /ihsan - Excellence Gate Verification

## Activation
When user invokes `/ihsan [artifact]` or needs quality verification.

## THE LAW
"We don't assume. If we must, we do it with Ihsan."

## 8-Dimensional Scoring

Score the artifact (0.0-1.0) across all dimensions:

### 1. Correctness (20%)
- Factual accuracy
- Logical consistency
- No contradictions
- Verifiable claims

### 2. Safety (20%)
- No injection vulnerabilities
- No harmful patterns
- Fail-closed behavior
- Security-first design

### 3. User Benefit (10%)
- Clear value proposition
- Solves stated problem
- Accessible design
- Practical utility

### 4. Efficiency (12%)
- Resource optimization
- No unnecessary complexity
- Performance-conscious
- Minimal dependencies

### 5. Auditability (12%)
- Traceable reasoning
- Documented decisions
- Reproducible results
- Third-party verifiable

### 6. Anti-Centralization (8%)
- Sovereignty-preserving
- No single points of failure
- Federated compatibility
- Local-first capable

### 7. Robustness (6%)
- Error handling
- Edge case coverage
- Graceful degradation
- Recovery mechanisms

### 8. Adl Fairness (12%)
- Unbiased behavior
- Equitable outcomes
- No hidden preferences
- Transparent tradeoffs

## Output Format
```
## Ihsan Gate: {artifact_name}

### Dimensional Scores
| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Correctness | 0.20 | X.XX | X.XX |
| Safety | 0.20 | X.XX | X.XX |
| User Benefit | 0.10 | X.XX | X.XX |
| Efficiency | 0.12 | X.XX | X.XX |
| Auditability | 0.12 | X.XX | X.XX |
| Anti-Central | 0.08 | X.XX | X.XX |
| Robustness | 0.06 | X.XX | X.XX |
| Adl Fairness | 0.12 | X.XX | X.XX |
| **TOTAL** | 1.00 | - | **X.XX** |

### Gate Status: {PASS (>=0.95) | WARN (0.80-0.95) | FAIL (<0.80)}

### Deficiencies
- [Dimension]: [Specific issue] -> [Remediation]

### Assumptions Made (with Ihsan)
- [Assumption]: [Justification] [Confidence: X%]
```

## Thresholds
- Production: >= 0.95 (REQUIRED)
- CI/Testing: >= 0.95 (REQUIRED)
- Development: >= 0.80 (WARNING)
