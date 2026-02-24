; BIZRA FATE Gate: Refined Arabic Linguistic Verification
(set-logic QF_S)

(define-fun is_triliteral ((root String)) Bool
  (= (str.len root) 6)
)

(declare-const kataba String)
(assert (= kataba "كتب"))
(assert (is_triliteral kataba))

(declare-const inna String)
(assert (= inna "إن"))
(assert (not (is_triliteral inna)))

(check-sat)
(get-model)
