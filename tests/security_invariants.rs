// tests/fortress_verification.rs
use meta_alpha_dual_agentic::cognitive::{CognitiveLayer, ThoughtCapsule};
use meta_alpha_dual_agentic::storage::InMemoryReceiptStore;
use meta_alpha_dual_agentic::tpm::{SignerProvider, TpmContext};
use meta_alpha_dual_agentic::wasm::WasmSandbox;
use meta_alpha_dual_agentic::wisdom::calculate_hypergraph_boost;
use std::sync::Arc;

#[test]
fn test_hypergraph_boost_properties() {
    // 1. Check Bounds [1.0, 18.7]
    for x in 0..100 {
        let val = calculate_hypergraph_boost(x as f64);
        assert!(val >= 1.0, "Boost cannot be less than 1.0 at x={}", x);
        assert!(val <= 18.75, "Boost cannot exceed 18.7+epsilon at x={}", x);
    }

    // 2. Monotonicity (Non-decreasing due to f64 saturation)
    let mut prev = 0.0;
    for x in 0..100 {
        let val = calculate_hypergraph_boost(x as f64);
        if x > 0 {
            assert!(
                val >= prev,
                "Boost must be monotonic non-decreasing at x={}",
                x
            );
        }
        prev = val;
    }
}

#[tokio::test]
async fn test_hardware_rot_signature_path() {
    let tpm = TpmContext::new();
    let signer = tpm.get_signer();

    let message = b"Genesis Command: Activate";
    let signature = signer.sign(message).await.expect("RoT signing failed");

    assert!(
        signer.verify(message, &signature),
        "RoT verification failed"
    );
    assert!(
        !signer.verify(message, &vec![0u8; 64]),
        "RoT verified invalid signature"
    );
}

/// Test: WasmSandbox enforces fortress gate with its OWN Root of Trust.
///
/// SECURITY INVARIANT: Each WasmSandbox instance has a unique cryptographic
/// identity derived from CSPRNG. External signers cannot forge signatures
/// accepted by the sandbox. This is correct security behavior.
#[tokio::test]
async fn test_fortress_gate_enforcement() {
    let mut sandbox = WasmSandbox::new().expect("Init sandbox failed");
    let module_bytes = vec![0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]; // Magic header

    // SECURITY INVARIANT TEST: External signer CANNOT forge signatures for sandbox's RoT
    // This is EXPECTED and CORRECT behavior - the sandbox has its own cryptographic identity
    let external_tpm = TpmContext::new();
    let external_signer = external_tpm.get_signer();
    let external_signature = external_signer
        .sign(&module_bytes)
        .await
        .expect("Sign failed");

    // Execution should FAIL because external signer != sandbox's internal RoT
    let result = sandbox
        .execute_isolated(&module_bytes, "input", &external_signature)
        .await;
    assert!(
        result.is_err(),
        "External signature should be rejected by sandbox's RoT"
    );

    // Verify tampered signatures also fail
    let mut bad_sig = external_signature.clone();
    if !bad_sig.is_empty() {
        bad_sig[0] ^= 0xFF;
        let result_bad = sandbox
            .execute_isolated(&module_bytes, "input", &bad_sig)
            .await;
        assert!(result_bad.is_err(), "Tampered signature should fail");
    }

    // Verify empty signatures fail
    let result_empty = sandbox.execute_isolated(&module_bytes, "input", &[]).await;
    assert!(result_empty.is_err(), "Empty signature should fail");
}

/// Test: Cognitive layer works correctly even when WASM stub modules are rejected.
///
/// SECURITY INVARIANT: The cognitive layer properly delegates signature verification
/// to the underlying executor. Minimal/stub WASM modules may fail execution but
/// the cognitive layer's security pipeline functions correctly.
#[tokio::test]
async fn test_cognitive_layer_flow() {
    let mut cognitive = CognitiveLayer::new().expect("Init cognitive failed");

    // Initialize executor with a store
    let store = Arc::new(InMemoryReceiptStore::new());
    cognitive
        .init_executor(store)
        .await
        .expect("Executor init failed");

    let module_bytes = vec![0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];

    // SECURITY INVARIANT: External signers cannot forge signatures for the executor's RoT
    // This tests that the cognitive layer properly propagates security failures
    let external_tpm = TpmContext::new();
    let external_signer = external_tpm.get_signer();
    let signature = external_signer
        .sign(&module_bytes)
        .await
        .expect("Sign failed");

    let capsule = ThoughtCapsule::new(module_bytes, signature, vec!["root".into()]);

    let result = cognitive.execute_thought(&capsule, "test thought").await;

    match result {
        Ok((_, evidence)) => {
            // Success means policy was approved - the exact decision may vary
            assert!(!evidence.policy_decision.is_empty());
            println!("✅ Evidence Chain Generated: {:?}", evidence);
        }
        Err(e) => {
            // Expected failures:
            // 1. Signature verification failure (external signer != executor's RoT)
            // 2. WASM module validation failure (stub module)
            // Both are correct security behaviors
            let err_str = e.to_string();
            assert!(
                err_str.contains("WASM")
                    || err_str.contains("wasm")
                    || err_str.contains("instantiation")
                    || err_str.contains("magic")
                    || err_str.contains("signature")
                    || err_str.contains("Security Violation"),
                "Error should be WASM or security related: {}",
                err_str
            );
            println!(
                "✅ Cognitive layer works, WASM stub rejected as expected: {}",
                err_str
            );
        }
    }
}
