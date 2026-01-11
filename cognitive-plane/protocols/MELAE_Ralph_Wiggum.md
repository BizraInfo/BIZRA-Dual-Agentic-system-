# MELAE Execution Log
**Status:** Systems Online
**Mode:** Autonomous Optimization
**Input Source:** User Query ("Ralph Wiggum Technique")
**Context:** The "Ralph Wiggum Technique" is a specific prompt engineering pattern for autonomous agents (specifically Claude Code/Dev Agents), characterized by a "dumb" continuous loop where the agent iterates on a task until a verification condition (like passing tests) is met, rather than trying to get it right in one shot.

---

### 1. Input Classification

**Input Data:**
*(Representative Ralph Wiggum Prompt)*
`"Fix the token refresh logic in auth.ts. Run tests after every change. Keep iterating and fixing errors until all tests pass. Output <promise>DONE</promise> only when success criteria are met."`

* **Type:** Agentic Loop Directive / Autonomous Command
* **Core Intent:** Delegate a task with a self-correcting feedback loop (Edit -> Test -> Fix -> Repeat).
* **Thinking Operation:** Iterative Debugging -> Verification -> Convergence.
* **Implicit Assumptions:** The agent has access to a terminal/test runner, can read error logs, and persistent memory (files) is available between loops.

### 2. Signal Extraction

Identifying high-value instruction elements.

| Signal Element | Type | Weight (1-5) | Notes |
| --- | --- | --- | --- |
| **"Fix token refresh logic"** | Task | 5 | The primary objective. |
| **"auth.ts"** | Scope | 5 | Specific file target. |
| **"Keep iterating... until tests pass"** | Loop/Constraint | 5 | The defining feature of the Wiggum technique (Condition-based stop). |
| **"Output <promise>DONE</promise>"** | Success Flag | 4 | Machine-readable stop token for the external loop harness. |
| **"Run tests after every change"** | Feedback Mechanism | 4 | Ensures "failures are data" for the next iteration. |

### 3. Noise Detection

Identifying vague, redundant, or passive elements.

| Noise Element | Severity | Penalty | Reasoning |
| --- | --- | --- | --- |
| **"Keep iterating and fixing errors"** | Low | -5 | Slightly redundant if "until tests pass" is already specified, but helpful for reinforcement. |
| **"only when success criteria are met"** | Low | -5 | Redundant; the `<promise>` tag already implies this. |

### 4. SNR Scoring (Signal-to-Noise Ratio)

* **Signal Score:** (23 weighted points) * 10 = 230
* **Noise Penalty:** 10
* **Raw Calculation:** 230 - 10 = 220 (Clamped to 100)
* **Initial SNR Score:** **95/100**

**Verdict:** **High-Efficiency Command.**
The Ralph Wiggum technique inherently forces high SNR because it relies on machine-verifiable exit conditions rather than conversational pleasantries. It shifts the burden from "smart prompting" to "smart verification."

### 5. Diagnostic Output

The input represents a paradigm shift from **Instructional Prompting** (telling the AI *how* to do it) to **Convergent Prompting** (telling the AI *when* it is done).

* **Top Signal Contributor:** The "Stop Condition" (until tests pass).
* **Top Noise Contributor:** Minor redundant phrasing regarding iteration.
* **Highest-Impact Improvement:** Define the test command explicitly (e.g., `npm run test:auth`) to remove ambiguity about *which* tests to run.

### 6. Variant Generation & Scoring

Generating 10 semantic equivalents to optimize the loop structure.

| Rank | Variant Prompt | SNR Score | Diagnostic |
| --- | --- | --- | --- |
| **1** | **[Task] Fix `auth.ts` refresh logic. [Constraint] Loop until `npm test` passes. [Output] `<promise>FIXED</promise>` on success.** | **99** | **Peak Ralph Wiggum.** Pure imperative data. Defines the verification command explicitly. |
| **2** | `Goal: Make auth.ts tests pass. Method: Read errors, fix code, retry. Stop Condition: Output "DONE" when passing.` | 97 | Very strong structured data format. |
| **3** | `Fix the bug in auth.ts. Do not stop until the test suite is green. Signal completion with "DONE".` | 94 | Clear, but "bug" is less specific than "refresh logic". |
| **4** | `Iterate on auth.ts until all tests pass. <promise>DONE</promise>` | 93 | Extremely concise, but misses the specific logic target (refresh). |
| **5** | `You are a loop agent. Fix the auth token logic. Verify with tests. Repeat until success.` | 90 | "You are a loop agent" is role noise. |
| **6** | `Keep working on auth.ts until it works. Run tests to check.` | 85 | "Until it works" is subjective/vague compared to "tests pass". |
| **7** | `Ralph loop: Fix auth.ts logic. Check your work with tests.` | 82 | Missing the explicit stop token instruction. |
| **8** | `I want you to fix the auth logic. Keep trying if you fail.` | 75 | "I want you" and "Keep trying" are conversational noise. |
| **9** | `Act like Ralph Wiggum and keep fixing the auth code until it's perfect.` | 70 | "Perfect" is not a verifiable state (unlike "tests pass"). |
| **10** | `Please fix the code in auth.ts and don't stop until you are done.` | 60 | "Please" and "don't stop" are weak instructions without a test anchor. |

### 7. Recommendations

* **Highest Precision:** Variant #1. It specifies the *exact* test command (`npm test`), leaving zero room for the agent to "hallucinate" a verification step.
* **Safest for Beginners:** Variant #3. Natural language but strictly bounded by the "green test suite" constraint.
* **Most Robust:** Variant #2. Breaking it into Goal/Method/Stop Condition prevents the model from ignoring the loop constraint.

### 8. Final Output

Optimized "Ralph Wiggum" Prompt for an Autonomous Agent Loop:

```markdown
[Objective]
Fix token refresh logic in `auth.ts`.

[Loop Constraints]
1. EXECUTE: `npm test tests/auth.test.ts` after every edit.
2. OBSERVE: Read failure logs.
3. ITERATE: Apply fixes based on logs.
4. REPEAT until exit code 0.

[Stop Protocol]
Output exactly `<promise>FIXED</promise>` when tests pass.
```
