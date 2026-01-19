//! BIZRA Cryptographic Layer
//! 
//! Giants Protocol Citation:
//! > "On the shoulders of Daniel J. Bernstein, Tanja Lange, and the NIST PQC team"
//! 
//! Provides unified interface to:
//! - Classical cryptography (Ed25519, SHA-256, BLAKE3)
//! - Post-Quantum Cryptography (ML-KEM/Kyber, ML-DSA/Dilithium)

pub mod pqc;

pub use pqc::{PqcKeyPair, PqcProvider, PqcSignature};
