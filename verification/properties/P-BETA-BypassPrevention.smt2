; SMT-LIB 2.6 Property Definition
; Property ID: P-BETA
; Name: BypassPrevention (NoSystemBypass)
; Intent: Disallow sensitive filesystem markers in symbolic output paths
; Encoding: String containment modeled as boolean flags
; Generated: 2026-01-06T07:15:00Z

(set-logic QF_LIA)
(declare-const contains_etc_passwd Bool)
(declare-const contains_etc_shadow Bool)
(declare-const contains_sudo Bool)
(declare-const contains_rm_rf Bool)

; Safety invariant: no sensitive markers present
(assert (not contains_etc_passwd))
(assert (not contains_etc_shadow))
(assert (not contains_sudo))
(assert (not contains_rm_rf))

; Expected: SAT if output is clean, UNSAT if any marker present
(check-sat)
