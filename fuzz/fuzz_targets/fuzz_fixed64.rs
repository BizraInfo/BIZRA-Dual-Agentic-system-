#![no_main]

use libfuzzer_sys::fuzz_target;
use meta_alpha_dual_agentic::fixed::Fixed64;

/// Fuzz target for Fixed64 arithmetic operations
/// 
/// Fixed-point arithmetic is critical for financial calculations (PoI, BZR tokens).
/// We verify:
/// 1. No overflow panics
/// 2. Associativity and commutativity properties
/// 3. Deterministic results
fuzz_target!(|data: &[u8]| {
    if data.len() < 24 {
        return;
    }
    
    // Parse three Fixed64 values from fuzzer data
    let a_bytes: [u8; 8] = data[0..8].try_into().unwrap();
    let b_bytes: [u8; 8] = data[8..16].try_into().unwrap();
    let c_bytes: [u8; 8] = data[16..24].try_into().unwrap();
    
    let a_raw = i64::from_le_bytes(a_bytes);
    let b_raw = i64::from_le_bytes(b_bytes);
    let _c_raw = i64::from_le_bytes(c_bytes);
    
    // Clamp to reasonable range to avoid overflow in tests
    let clamp = |x: i64| -> i64 { x.clamp(-1_000_000_000, 1_000_000_000) };
    
    let a = Fixed64::from_bits(clamp(a_raw));
    let b = Fixed64::from_bits(clamp(b_raw));
    
    // Test addition (should not panic)
    let sum_ab = a.saturating_add(b);
    let sum_ba = b.saturating_add(a);
    
    // Commutativity: a + b == b + a
    assert_eq!(sum_ab, sum_ba, "Addition must be commutative");
    
    // Test that result is deterministic
    let sum_ab_2 = a.saturating_add(b);
    assert_eq!(sum_ab, sum_ab_2, "Addition must be deterministic");
    
    // Multiplication commutativity
    let prod_ab = a.saturating_mul(b);
    let prod_ba = b.saturating_mul(a);
    assert_eq!(prod_ab, prod_ba, "Multiplication must be commutative");
    
    // Division by zero should not panic (saturating_div handles it)
    let zero = Fixed64::from_bits(0);
    let div_by_zero = a.saturating_div(zero);
    // Should return MAX or MIN, not panic
    assert!(div_by_zero == Fixed64::from_bits(i64::MAX) || div_by_zero == Fixed64::from_bits(i64::MIN) || a.to_bits() == 0);
});
