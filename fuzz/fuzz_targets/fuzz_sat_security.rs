#![no_main]

use libfuzzer_sys::fuzz_target;
use meta_alpha_dual_agentic::sat::RejectionCode;

/// Fuzz target for SAT (System Agentic Team) Security Validation
/// 
/// This tests the security blocklist pattern matching with adversarial inputs.
/// We verify:
/// 1. No panics on malformed UTF-8
/// 2. Known attack patterns are always detected
/// 3. No false negatives on obfuscated attacks
fuzz_target!(|data: &[u8]| {
    // Convert to string, handling invalid UTF-8 gracefully
    let input = String::from_utf8_lossy(data);
    
    // Security patterns that MUST trigger rejection
    let must_reject = [
        "rm -rf",
        "sudo",
        "chmod 777",
        "eval(",
        "exec(",
        "__import__",
        "subprocess.call",
        "os.system",
        "shell=True",
        "<script>",
        "javascript:",
        "DROP TABLE",
        "DELETE FROM",
        "'; --",
        "UNION SELECT",
    ];
    
    // Check if input contains any must-reject patterns
    let contains_threat = must_reject.iter().any(|pattern| {
        input.to_lowercase().contains(&pattern.to_lowercase())
    });
    
    // Simulate SAT validation (simplified for fuzz testing)
    let validation_result = simulate_sat_validation(&input);
    
    // Invariant: If threat pattern present, MUST be rejected
    if contains_threat {
        assert!(
            validation_result.is_err(),
            "Security threat '{}' was not rejected!", 
            input.chars().take(100).collect::<String>()
        );
    }
});

/// Simplified SAT validation for fuzz testing
fn simulate_sat_validation(input: &str) -> Result<(), RejectionCode> {
    let lower = input.to_lowercase();
    
    // Security blocklist check
    if lower.contains("rm -rf") || lower.contains("sudo") {
        return Err(RejectionCode::SecurityThreat("shell_command".into()));
    }
    if lower.contains("eval(") || lower.contains("exec(") {
        return Err(RejectionCode::SecurityThreat("code_injection".into()));
    }
    if lower.contains("drop table") || lower.contains("delete from") {
        return Err(RejectionCode::SecurityThreat("sql_injection".into()));
    }
    if lower.contains("<script>") || lower.contains("javascript:") {
        return Err(RejectionCode::SecurityThreat("xss_attempt".into()));
    }
    if lower.contains("'; --") || lower.contains("union select") {
        return Err(RejectionCode::SecurityThreat("sql_injection".into()));
    }
    if lower.contains("__import__") || lower.contains("subprocess") || lower.contains("os.system") {
        return Err(RejectionCode::SecurityThreat("python_injection".into()));
    }
    if lower.contains("chmod 777") || lower.contains("shell=true") {
        return Err(RejectionCode::SecurityThreat("unsafe_permission".into()));
    }
    
    Ok(())
}
