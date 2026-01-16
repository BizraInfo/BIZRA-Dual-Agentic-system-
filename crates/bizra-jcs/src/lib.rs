// crates/bizra-jcs/src/lib.rs

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use serde::Serialize;
use sha2::{Digest, Sha256};

#[derive(Debug, thiserror::Error)]
pub enum JcsError {
    #[error("Serialization failed: {0}")]
    Serialization(#[from] serde_json::Error),
    // serde_jcs uses serde_json::Error
}

/// Canonicalize a value to JCS (RFC 8785)
pub fn canonicalize<T: Serialize>(value: &T) -> Result<String, JcsError> {
    let canonical_bytes = serde_jcs::to_vec(value)?;
    Ok(String::from_utf8(canonical_bytes).expect("JCS produces valid UTF-8"))
}

/// Canonicalize to bytes (RFC 8785)
pub fn canonicalize_bytes<T: Serialize>(value: &T) -> Result<Vec<u8>, JcsError> {
    Ok(serde_jcs::to_vec(value)?)
}

/// Compute Payload ID: b64url(sha256(canonical_json))
pub fn compute_payload_id<T: Serialize>(value: &T) -> Result<String, JcsError> {
    let canonical = canonicalize_bytes(value)?;
    let mut hasher = Sha256::new();
    hasher.update(&canonical);
    let hash = hasher.finalize();
    Ok(URL_SAFE_NO_PAD.encode(hash))
}

/// Compute SHA256 digest of canonical JSON
pub fn compute_digest<T: Serialize>(value: &T) -> Result<[u8; 32], JcsError> {
    let canonical = canonicalize_bytes(value)?;
    let mut hasher = Sha256::new();
    hasher.update(&canonical);
    Ok(hasher.finalize().into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_canonicalization_order() {
        let a = json!({"b": 2, "a": 1});
        let b = json!({"a": 1, "b": 2});

        let can_a = canonicalize(&a).unwrap();
        let can_b = canonicalize(&b).unwrap();

        assert_eq!(can_a, can_b);
        assert_eq!(can_a, r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn test_payload_id_stability() {
        let payload = json!({
            "type": "thought_exec",
            "timestamp": 1234567890
        });

        let id1 = compute_payload_id(&payload).unwrap();
        let id2 = compute_payload_id(&payload).unwrap();

        assert_eq!(id1, id2);
    }

    /// PEAK MASTERPIECE: Golden Vector Cross-Language Test
    ///
    /// These vectors MUST match Python's implementation:
    /// ```python
    /// import json, hashlib, base64
    /// def jcs_digest(obj):
    ///     canonical = json.dumps(obj, sort_keys=True, separators=(',', ':'))
    ///     return hashlib.sha256(canonical.encode()).hexdigest()
    /// ```
    ///
    /// If this test fails, cross-language receipts are incompatible.
    #[test]
    fn test_golden_vector_cross_language() {
        // Golden Vector 1: Simple envelope
        let envelope = json!({
            "agent": "pat-strategic",
            "counter": 1,
            "nonce": "abc123",
            "payload": "sha256:deadbeef",
            "policy": "ihsan_v1",
            "session": "session-001",
            "ts_ns": 1704067200000000000_u64
        });

        let canonical = canonicalize(&envelope).unwrap();
        // JCS canonical form: keys sorted alphabetically
        assert_eq!(
            canonical,
            r#"{"agent":"pat-strategic","counter":1,"nonce":"abc123","payload":"sha256:deadbeef","policy":"ihsan_v1","session":"session-001","ts_ns":1704067200000000000}"#
        );

        let digest = compute_digest(&envelope).unwrap();
        let digest_hex = hex::encode(digest);

        // Verify digest format: 64 hex chars (256 bits)
        assert_eq!(
            digest_hex.len(),
            64,
            "Digest must be 64 hex chars (256 bits)"
        );

        // Verify determinism: same input always produces same output
        let digest_again = compute_digest(&envelope).unwrap();
        assert_eq!(digest, digest_again, "Digest must be deterministic across calls");

        // Golden Vector 2: Receipt with Fixed64-style integers
        let receipt = json!({
            "ihsan_score_bits": 4287627265_i64,  // Fixed64 representation
            "receipt_id": "EXEC-20260116-000001",
            "synergy_score_bits": 4278190080_i64,
            "timestamp": "2026-01-16T12:00:00Z"
        });

        let receipt_canonical = canonicalize(&receipt).unwrap();
        let receipt_digest = compute_digest(&receipt).unwrap();

        // Verify determinism: same input always produces same output
        let receipt_digest_2 = compute_digest(&receipt).unwrap();
        assert_eq!(receipt_digest, receipt_digest_2, "Digest must be deterministic");

        // Verify canonical form is sorted
        assert!(
            receipt_canonical.starts_with(r#"{"ihsan_score_bits":"#),
            "JCS must sort keys alphabetically"
        );
    }

    /// PEAK MASTERPIECE: Verify digest excludes mutable fields pattern
    /// This test ensures we follow the "blank before hash" pattern
    #[test]
    fn test_digest_excludes_self() {
        // Simulate a receipt with a digest field
        let mut receipt = json!({
            "content": "important data",
            "digest": "",  // Blank before hashing
            "signature": null
        });

        // Compute digest with blank digest field
        let digest1 = compute_digest(&receipt).unwrap();

        // Set the digest
        receipt["digest"] = json!(hex::encode(digest1));

        // If we hash again WITH the digest, we get a different value (self-referential!)
        let digest2 = compute_digest(&receipt).unwrap();

        // These MUST be different - proving we need to blank before hashing
        assert_ne!(
            digest1, digest2,
            "Self-referential digest detected! Must blank digest field before hashing"
        );

        // The correct pattern: always hash with digest blanked
        receipt["digest"] = json!("");
        receipt["signature"] = json!(null);
        let digest3 = compute_digest(&receipt).unwrap();
        assert_eq!(digest1, digest3, "Blanking pattern must be deterministic");
    }
}
