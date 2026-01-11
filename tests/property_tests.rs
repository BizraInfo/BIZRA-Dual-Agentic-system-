// tests/property_tests.rs - Property-Based Tests for MASTERPIECE Hardening
// These tests use controlled random inputs to verify invariants
// Run with: cargo test --test property_tests

use meta_alpha_dual_agentic::fixed::Fixed64;
use meta_alpha_dual_agentic::ihsan;
use meta_alpha_dual_agentic::sat::RejectionCode;
use std::collections::BTreeMap;

/// Test Fixed64 arithmetic properties with pseudo-random inputs
#[test]
fn fixed64_addition_is_commutative() {
    let test_values = [
        0i64, 1, -1, 100, -100, 
        1000000, -1000000,
        i64::MAX / 2, i64::MIN / 2,
    ];
    
    for &a_raw in &test_values {
        for &b_raw in &test_values {
            let a = Fixed64::from_bits(a_raw);
            let b = Fixed64::from_bits(b_raw);
            
            let sum_ab = a.saturating_add(b);
            let sum_ba = b.saturating_add(a);
            
            assert_eq!(
                sum_ab, sum_ba,
                "Addition must be commutative: {:?} + {:?}", a, b
            );
        }
    }
}

#[test]
fn fixed64_multiplication_is_commutative() {
    let test_values = [
        0i64, 1, -1, 100, -100, 
        Fixed64::SCALE,  // 1.0
        Fixed64::SCALE / 2,  // 0.5
        Fixed64::SCALE * 2,  // 2.0
    ];
    
    for &a_raw in &test_values {
        for &b_raw in &test_values {
            let a = Fixed64::from_bits(a_raw);
            let b = Fixed64::from_bits(b_raw);
            
            let prod_ab = a.saturating_mul(b);
            let prod_ba = b.saturating_mul(a);
            
            assert_eq!(
                prod_ab, prod_ba,
                "Multiplication must be commutative: {:?} * {:?}", a, b
            );
        }
    }
}

#[test]
fn fixed64_division_by_zero_does_not_panic() {
    let test_values = [
        0i64, 1, -1, i64::MAX, i64::MIN,
        Fixed64::SCALE, -Fixed64::SCALE,
    ];
    
    let zero = Fixed64::from_bits(0);
    
    for &a_raw in &test_values {
        let a = Fixed64::from_bits(a_raw);
        // This should not panic
        let result = a.saturating_div(zero);
        
        // Should return MAX or MIN (or zero for 0/0)
        let is_valid = result == Fixed64::from_bits(i64::MAX) 
            || result == Fixed64::from_bits(i64::MIN)
            || a_raw == 0;
        
        assert!(
            is_valid,
            "Division by zero should saturate: {:?} / zero = {:?}", 
            a, result
        );
    }
}

#[test]
fn fixed64_saturating_ops_never_overflow() {
    let extremes = [i64::MAX, i64::MIN, i64::MAX - 1, i64::MIN + 1];
    
    for &a_raw in &extremes {
        for &b_raw in &extremes {
            let a = Fixed64::from_bits(a_raw);
            let b = Fixed64::from_bits(b_raw);
            
            // None of these should panic
            let _ = a.saturating_add(b);
            let _ = a.saturating_sub(b);
            let _ = a.saturating_mul(b);
            if b_raw != 0 {
                let _ = a.saturating_div(b);
            }
        }
    }
}

/// Test Ihsān score properties
#[test]
fn ihsan_score_in_valid_range() {
    let test_cases = [
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],  // All zeros
        [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],  // All ones
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],  // All halves
        [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0],  // Alternating
        [0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99],  // Near-max
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],  // Near-min
    ];
    
    let dimensions = [
        "correctness",
        "safety",
        "user_benefit",
        "efficiency",
        "auditability",
        "anti_centralization",
        "robustness",
        "adl_fairness",
    ];
    
    for scores in &test_cases {
        let mut dim_map = BTreeMap::new();
        for (i, name) in dimensions.iter().enumerate() {
            dim_map.insert(name.to_string(), scores[i]);
        }
        
        let result = ihsan::score(&dim_map).expect("Valid input should succeed");
        
        assert!(
            result >= 0.0 && result <= 1.0,
            "Score must be in [0, 1]: got {} for {:?}",
            result, scores
        );
        assert!(
            result.is_finite(),
            "Score must be finite: got {} for {:?}",
            result, scores
        );
    }
}

#[test]
fn ihsan_score_is_deterministic() {
    let dimensions = [
        "correctness",
        "safety",
        "user_benefit",
        "efficiency",
        "auditability",
        "anti_centralization",
        "robustness",
        "adl_fairness",
    ];
    let scores = [0.8, 0.9, 0.7, 0.6, 0.85, 0.5, 0.75, 0.65];
    
    let mut dim_map = BTreeMap::new();
    for (i, name) in dimensions.iter().enumerate() {
        dim_map.insert(name.to_string(), scores[i]);
    }
    
    let result1 = ihsan::score(&dim_map).expect("Should succeed");
    let result2 = ihsan::score(&dim_map).expect("Should succeed");
    let result3 = ihsan::score(&dim_map).expect("Should succeed");
    
    assert_eq!(result1, result2, "Score must be deterministic");
    assert_eq!(result2, result3, "Score must be deterministic");
}

#[test]
fn ihsan_rejects_invalid_inputs() {
    let dimensions = [
        "correctness",
        "safety",
        "user_benefit",
        "efficiency",
        "auditability",
        "anti_centralization",
        "robustness",
        "adl_fairness",
    ];
    
    // Test with out-of-range value
    let mut dim_map = BTreeMap::new();
    for (i, name) in dimensions.iter().enumerate() {
        dim_map.insert(name.to_string(), if i == 0 { 1.5 } else { 0.5 });
    }
    
    assert!(
        ihsan::score(&dim_map).is_err(),
        "Should reject score > 1.0"
    );
    
    // Test with negative value
    dim_map.insert("correctness".to_string(), -0.1);
    assert!(
        ihsan::score(&dim_map).is_err(),
        "Should reject score < 0.0"
    );
    
    // Test with NaN
    dim_map.insert("correctness".to_string(), f64::NAN);
    assert!(
        ihsan::score(&dim_map).is_err(),
        "Should reject NaN"
    );
    
    // Test with infinity
    dim_map.insert("correctness".to_string(), f64::INFINITY);
    assert!(
        ihsan::score(&dim_map).is_err(),
        "Should reject Infinity"
    );
}

/// Test SAT security patterns
#[test]
fn sat_rejection_code_display() {
    let codes = [
        RejectionCode::SecurityThreat("test".into()),
        RejectionCode::FormalViolation("test".into()),
        RejectionCode::EthicsViolation("test".into()),
        RejectionCode::PerformanceBudgetExceeded("test".into()),
        RejectionCode::ConsistencyFailure("test".into()),
        RejectionCode::ResourceConstraintViolated("test".into()),
        RejectionCode::ThermalThrottle("test".into()),
        RejectionCode::IhsanUnsat("test".into()),
        RejectionCode::Quarantine("test".into()),
    ];
    
    for code in &codes {
        let display = format!("{}", code);
        assert!(!display.is_empty(), "Display should not be empty");
        assert!(display.contains("test"), "Display should contain message");
    }
}

#[test]
fn sat_rejection_codes_are_distinct() {
    let security = RejectionCode::SecurityThreat("same".into());
    let formal = RejectionCode::FormalViolation("same".into());
    let ethics = RejectionCode::EthicsViolation("same".into());
    
    assert_ne!(security, formal);
    assert_ne!(formal, ethics);
    assert_ne!(security, ethics);
}

/// Edge case: Very small fixed-point values
#[test]
fn fixed64_small_value_precision() {
    let epsilon = Fixed64::from_bits(1);  // Smallest representable value
    let one = Fixed64::ONE;
    
    let result = one.saturating_add(epsilon);
    assert!(result.to_bits() > one.to_bits(), "Should be able to add epsilon");
    
    let back = result.saturating_sub(epsilon);
    assert_eq!(back, one, "Subtraction should be precise");
}

/// Edge case: Fixed-point conversion round-trip
#[test]
fn fixed64_f64_roundtrip() {
    let test_values = [0.0, 1.0, -1.0, 0.5, 0.25, 0.125, 100.0, -100.0];
    
    for &f in &test_values {
        let fixed = Fixed64::from_f64(f);
        let back = fixed.to_f64();
        
        assert!(
            (back - f).abs() < 1e-9,
            "f64 round-trip should be precise: {} -> {:?} -> {}",
            f, fixed, back
        );
    }
}
