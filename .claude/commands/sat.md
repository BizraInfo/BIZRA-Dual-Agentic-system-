# /sat - System Agentic Team Validation

## Activation
When user invokes `/sat [artifact]` or needs comprehensive validation.

## 5-Validator Consensus

All artifacts face Byzantine-fault-tolerant validation with VETO authority.

### 1. Security Sentinel (VETO Power, Weight: 2.5)
**Blocklist Detection**:
- Command injection: `rm -rf`, `eval`, `exec`, `subprocess`, `os.system`
- SQL injection: `'; DROP`, `UNION SELECT`, `OR 1=1`
- XSS patterns: `<script>`, `javascript:`, `onerror=`
- Path traversal: `../`, `..\\`
- Secrets exposure: API keys, credentials, tokens

**Check**: Does this artifact introduce any security vulnerabilities?

### 2. Formal Validator (Weight: 1.8)
**Z3 SMT Consistency**:
- Logical contradiction detection
- Invariant preservation
- Type safety verification
- Precondition/postcondition satisfaction

**Check**: Is this artifact formally consistent and provable?

### 3. Ethics Guardian (VETO Power, Weight: 2.0)
**Blocklist Detection**:
- Harm patterns: `harm`, `attack`, `exploit`, `steal`
- Deception: `deceive`, `manipulate`, `trick`
- Illegal: `illegal`, `unauthorized`, `bypass`
- Bias indicators: Discriminatory patterns

**Check**: Does this artifact violate ethical principles or Ihsan?

### 4. Resource Guardian (Weight: 1.2)
**Budget Enforcement**:
- Memory limits respected
- CPU/time budgets maintained
- Storage constraints satisfied
- Network usage appropriate

**Check**: Does this artifact stay within resource constraints?

### 5. Context Validator (Weight: 1.0)
**Coherence Verification**:
- Request alignment
- State consistency
- Interface compatibility
- Dependency satisfaction

**Check**: Does this artifact fit coherently in the system context?

## Consensus Rules
- **Security Threat**: ANY rejection = BLOCKED (VETO)
- **Ethics Violation**: ANY rejection = BLOCKED (VETO)
- **Other Issues**: 3/5 approval required (Byzantine)

## Output Format
```
## SAT Validation: {artifact_name}

### Validator Results
| Validator | Status | Weight | Notes |
|-----------|--------|--------|-------|
| Security Sentinel | PASS/VETO | 2.5 | ... |
| Formal Validator | PASS/FAIL | 1.8 | ... |
| Ethics Guardian | PASS/VETO | 2.0 | ... |
| Resource Guardian | PASS/FAIL | 1.2 | ... |
| Context Validator | PASS/FAIL | 1.0 | ... |

### Consensus: {APPROVED | BLOCKED | REJECTED}
- Approval Score: X/5 validators
- Weighted Score: X.X/8.5

### Rejection Codes (if any)
- [Code]: [Explanation]

### Remediation Required
1. [Action item]
```

## Rejection Codes
- `SecurityThreat` - Security blocklist triggered
- `FormalViolation` - Logical inconsistency detected
- `EthicsViolation` - Ethics blocklist triggered
- `PerformanceBudgetExceeded` - Resource limits breached
- `ConsistencyFailure` - Context incoherence detected
- `IhsanUnsat` - Below Ihsan threshold
