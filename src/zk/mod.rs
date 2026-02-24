//! BIZRA ZK Module
//!
//! Provides zero-knowledge proof backends for verifiable computation.
//! 
//! Feature-gated backends:
//! - `zk_stub`: Development stub (no cryptographic guarantees)
//! - `zk_halo2`: Production Halo2 backend (real ZK proofs)

pub mod verifier;

#[cfg(feature = "zk_halo2")]
pub mod halo2_backend;

// Re-export the stub verifier (always available)
pub use verifier::{ZKVerifier, StateProof};

// Re-export Halo2 backend when enabled
#[cfg(feature = "zk_halo2")]
pub use halo2_backend::{Halo2Backend, Halo2StateProof, ReceiptCircuit};
