; SMT-LIB 2.6 Property Definition
; Property ID: P-ALPHA
; Name: ActionBudgetLimit
; Intent: Enforce that actual action count never exceeds permitted limit (≤10)
; Generated: 2026-01-06T07:15:00Z

(set-logic LIA)
(declare-const action_limit Int)
(declare-const current_count Int)
(declare-const max_allowed Int)

; Define maximum allowed actions
(assert (= max_allowed 10))

; Constraint: limit must not exceed maximum
(assert (<= action_limit max_allowed))

; Safety property: current count must be ≤ limit
(assert (<= current_count action_limit))

; Check satisfiability
; Expected: SAT if current_count ≤ 10, UNSAT if current_count > 10
(check-sat)
(get-model)
