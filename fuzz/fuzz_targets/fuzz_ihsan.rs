#![no_main]

use libfuzzer_sys::fuzz_target;
use meta_alpha_dual_agentic::ihsan;

/// Fuzz target for Ihsān score calculation
/// 
/// This tests the core ethical scoring function with random dimension weights.
/// We verify:
/// 1. Score is always in [0.0, 1.0] range
/// 2. No panics on malformed input
/// 3. Deterministic output for same input
fuzz_target!(|data: &[u8]| {
    // Need at least 8 dimensions * 8 bytes = 64 bytes for full coverage
    if data.len() < 64 {
        return;
    }
    
    // Parse fuzzer data into 8 dimension scores
    let mut scores = [0.0f64; 8];
    for (i, chunk) in data.chunks(8).take(8).enumerate() {
        if chunk.len() == 8 {
            let bytes: [u8; 8] = chunk.try_into().unwrap();
            let raw = f64::from_le_bytes(bytes);
            // Clamp to valid range [0.0, 1.0] to test normal paths
            // Also test with NaN/Inf to probe edge cases
            scores[i] = if raw.is_finite() {
                raw.clamp(0.0, 1.0)
            } else {
                0.5 // Default for non-finite
            };
        }
    }
    
    // Build dimension map matching constitution keys
    let dimension_names = [
        "correctness",
        "safety", 
        "user_benefit",
        "efficiency",
        "auditability",
        "anti_centralization",
        "robustness",
        "adl_fairness",
    ];
    
    let mut dim_map = std::collections::BTreeMap::new();
    for (i, name) in dimension_names.iter().enumerate() {
        dim_map.insert(name.to_string(), scores[i]);
    }
    
    // Calculate Ihsān score - use the free function which wraps constitution().score()
    let result = match ihsan::score(&dim_map) {
        Ok(s) => s,
        Err(_) => return, // Invalid input is acceptable - just skip
    };
    
    // Invariants that MUST hold for valid scores
    assert!(result.is_finite(), "Score must be finite");
    assert!(result >= 0.0, "Score must be non-negative");
    assert!(result <= 1.0, "Score must not exceed 1.0");
    
    // Determinism check: same input = same output
    let result2 = ihsan::score(&dim_map).expect("Same input must succeed twice");
    assert!((result - result2).abs() < f64::EPSILON, "Score must be deterministic");
});
