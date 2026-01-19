//! Post-Quantum Cryptography Module
//!
//! BIZRA GENESIS - NIST ML-KEM (Kyber) and ML-DSA (Dilithium) Integration
//!
//! Giants Protocol Citation:
//! > "On the shoulders of the CRYSTALS team (Bos, Ducas, Kiltz, Lepoint, Lyubashevsky, et al.)"
//!
//! This module provides quantum-resistant key encapsulation and digital signatures.
//! Feature-gated behind `post-quantum` to avoid bloating non-PQC builds.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Result type for PQC operations
pub type PqcResult<T> = Result<T, PqcError>;

/// Errors from PQC operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PqcError {
    /// Key generation failed
    KeyGeneration(String),
    /// Encapsulation failed
    Encapsulation(String),
    /// Decapsulation failed
    Decapsulation(String),
    /// Signature failed
    Signing(String),
    /// Verification failed
    Verification(String),
    /// Feature not enabled
    FeatureDisabled,
}

impl fmt::Display for PqcError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::KeyGeneration(s) => write!(f, "PQC key generation failed: {}", s),
            Self::Encapsulation(s) => write!(f, "PQC encapsulation failed: {}", s),
            Self::Decapsulation(s) => write!(f, "PQC decapsulation failed: {}", s),
            Self::Signing(s) => write!(f, "PQC signing failed: {}", s),
            Self::Verification(s) => write!(f, "PQC verification failed: {}", s),
            Self::FeatureDisabled => write!(f, "PQC feature not enabled"),
        }
    }
}

impl std::error::Error for PqcError {}

/// PQC algorithm selection
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PqcAlgorithm {
    /// NIST ML-KEM-768 (formerly Kyber-768)
    MlKem768,
    /// NIST ML-KEM-1024 (formerly Kyber-1024) - Higher security
    MlKem1024,
    /// NIST ML-DSA-65 (formerly Dilithium3)
    MlDsa65,
    /// NIST ML-DSA-87 (formerly Dilithium5) - Higher security
    MlDsa87,
}

impl PqcAlgorithm {
    /// Get NIST security level
    pub fn security_level(&self) -> u8 {
        match self {
            Self::MlKem768 | Self::MlDsa65 => 3,  // ~128-bit equivalent
            Self::MlKem1024 | Self::MlDsa87 => 5, // ~256-bit equivalent
        }
    }
    
    /// Is this a KEM (Key Encapsulation Mechanism)?
    pub fn is_kem(&self) -> bool {
        matches!(self, Self::MlKem768 | Self::MlKem1024)
    }
    
    /// Is this a signature algorithm?
    pub fn is_signature(&self) -> bool {
        matches!(self, Self::MlDsa65 | Self::MlDsa87)
    }
}

/// PQC Key Pair (generic over algorithm)
#[derive(Clone, Serialize, Deserialize)]
pub struct PqcKeyPair {
    /// Algorithm used
    pub algorithm: PqcAlgorithm,
    /// Public key bytes
    pub public_key: Vec<u8>,
    /// Secret key bytes (sensitive!)
    #[serde(skip_serializing)]
    secret_key: Vec<u8>,
}

impl fmt::Debug for PqcKeyPair {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("PqcKeyPair")
            .field("algorithm", &self.algorithm)
            .field("public_key_len", &self.public_key.len())
            .field("secret_key", &"[REDACTED]")
            .finish()
    }
}

/// PQC Signature
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PqcSignature {
    /// Algorithm used
    pub algorithm: PqcAlgorithm,
    /// Signature bytes
    pub signature: Vec<u8>,
}

/// Encapsulated shared secret
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PqcEncapsulation {
    /// Ciphertext to send to recipient
    pub ciphertext: Vec<u8>,
    /// Shared secret (only available to encapsulator)
    #[serde(skip_serializing)]
    pub shared_secret: Vec<u8>,
}

/// PQC Provider - Main interface for post-quantum cryptographic operations
pub struct PqcProvider {
    /// Default KEM algorithm
    default_kem: PqcAlgorithm,
    /// Default signature algorithm
    default_sig: PqcAlgorithm,
}

impl Default for PqcProvider {
    fn default() -> Self {
        Self::new()
    }
}

impl PqcProvider {
    /// Create a new PQC provider with recommended defaults
    pub fn new() -> Self {
        Self {
            default_kem: PqcAlgorithm::MlKem768,
            default_sig: PqcAlgorithm::MlDsa65,
        }
    }
    
    /// Create a provider with maximum security settings
    pub fn max_security() -> Self {
        Self {
            default_kem: PqcAlgorithm::MlKem1024,
            default_sig: PqcAlgorithm::MlDsa87,
        }
    }
    
    /// Generate a KEM key pair
    #[cfg(feature = "post-quantum")]
    pub fn generate_kem_keypair(&self) -> PqcResult<PqcKeyPair> {
        self.generate_kem_keypair_with(self.default_kem)
    }
    
    /// Generate a KEM key pair with specific algorithm
    #[cfg(feature = "post-quantum")]
    pub fn generate_kem_keypair_with(&self, algorithm: PqcAlgorithm) -> PqcResult<PqcKeyPair> {
        use pqcrypto_kyber::{kyber768, kyber1024};
        use pqcrypto_traits::kem::*;
        
        match algorithm {
            PqcAlgorithm::MlKem768 => {
                let (pk, sk) = kyber768::keypair();
                Ok(PqcKeyPair {
                    algorithm,
                    public_key: pk.as_bytes().to_vec(),
                    secret_key: sk.as_bytes().to_vec(),
                })
            }
            PqcAlgorithm::MlKem1024 => {
                let (pk, sk) = kyber1024::keypair();
                Ok(PqcKeyPair {
                    algorithm,
                    public_key: pk.as_bytes().to_vec(),
                    secret_key: sk.as_bytes().to_vec(),
                })
            }
            _ => Err(PqcError::KeyGeneration("Not a KEM algorithm".into())),
        }
    }
    
    /// Encapsulate a shared secret using recipient's public key
    #[cfg(feature = "post-quantum")]
    pub fn encapsulate(&self, recipient_pk: &PqcKeyPair) -> PqcResult<PqcEncapsulation> {
        use pqcrypto_kyber::{kyber768, kyber1024};
        use pqcrypto_traits::kem::*;
        
        match recipient_pk.algorithm {
            PqcAlgorithm::MlKem768 => {
                let pk = kyber768::PublicKey::from_bytes(&recipient_pk.public_key)
                    .map_err(|e| PqcError::Encapsulation(format!("{:?}", e)))?;
                let (ss, ct) = kyber768::encapsulate(&pk);
                Ok(PqcEncapsulation {
                    ciphertext: ct.as_bytes().to_vec(),
                    shared_secret: ss.as_bytes().to_vec(),
                })
            }
            PqcAlgorithm::MlKem1024 => {
                let pk = kyber1024::PublicKey::from_bytes(&recipient_pk.public_key)
                    .map_err(|e| PqcError::Encapsulation(format!("{:?}", e)))?;
                let (ss, ct) = kyber1024::encapsulate(&pk);
                Ok(PqcEncapsulation {
                    ciphertext: ct.as_bytes().to_vec(),
                    shared_secret: ss.as_bytes().to_vec(),
                })
            }
            _ => Err(PqcError::Encapsulation("Not a KEM algorithm".into())),
        }
    }
    
    /// Decapsulate to recover shared secret
    #[cfg(feature = "post-quantum")]
    pub fn decapsulate(&self, keypair: &PqcKeyPair, ciphertext: &[u8]) -> PqcResult<Vec<u8>> {
        use pqcrypto_kyber::{kyber768, kyber1024};
        use pqcrypto_traits::kem::*;
        
        match keypair.algorithm {
            PqcAlgorithm::MlKem768 => {
                let sk = kyber768::SecretKey::from_bytes(&keypair.secret_key)
                    .map_err(|e| PqcError::Decapsulation(format!("{:?}", e)))?;
                let ct = kyber768::Ciphertext::from_bytes(ciphertext)
                    .map_err(|e| PqcError::Decapsulation(format!("{:?}", e)))?;
                let ss = kyber768::decapsulate(&ct, &sk);
                Ok(ss.as_bytes().to_vec())
            }
            PqcAlgorithm::MlKem1024 => {
                let sk = kyber1024::SecretKey::from_bytes(&keypair.secret_key)
                    .map_err(|e| PqcError::Decapsulation(format!("{:?}", e)))?;
                let ct = kyber1024::Ciphertext::from_bytes(ciphertext)
                    .map_err(|e| PqcError::Decapsulation(format!("{:?}", e)))?;
                let ss = kyber1024::decapsulate(&ct, &sk);
                Ok(ss.as_bytes().to_vec())
            }
            _ => Err(PqcError::Decapsulation("Not a KEM algorithm".into())),
        }
    }
    
    /// Generate a signature key pair
    #[cfg(feature = "post-quantum")]
    pub fn generate_sig_keypair(&self) -> PqcResult<PqcKeyPair> {
        self.generate_sig_keypair_with(self.default_sig)
    }
    
    /// Generate a signature key pair with specific algorithm
    #[cfg(feature = "post-quantum")]
    pub fn generate_sig_keypair_with(&self, algorithm: PqcAlgorithm) -> PqcResult<PqcKeyPair> {
        use pqcrypto_dilithium::{dilithium3, dilithium5};
        use pqcrypto_traits::sign::*;
        
        match algorithm {
            PqcAlgorithm::MlDsa65 => {
                let (pk, sk) = dilithium3::keypair();
                Ok(PqcKeyPair {
                    algorithm,
                    public_key: pk.as_bytes().to_vec(),
                    secret_key: sk.as_bytes().to_vec(),
                })
            }
            PqcAlgorithm::MlDsa87 => {
                let (pk, sk) = dilithium5::keypair();
                Ok(PqcKeyPair {
                    algorithm,
                    public_key: pk.as_bytes().to_vec(),
                    secret_key: sk.as_bytes().to_vec(),
                })
            }
            _ => Err(PqcError::KeyGeneration("Not a signature algorithm".into())),
        }
    }
    
    /// Sign a message
    #[cfg(feature = "post-quantum")]
    pub fn sign(&self, keypair: &PqcKeyPair, message: &[u8]) -> PqcResult<PqcSignature> {
        use pqcrypto_dilithium::{dilithium3, dilithium5};
        use pqcrypto_traits::sign::*;
        
        match keypair.algorithm {
            PqcAlgorithm::MlDsa65 => {
                let sk = dilithium3::SecretKey::from_bytes(&keypair.secret_key)
                    .map_err(|e| PqcError::Signing(format!("{:?}", e)))?;
                let sig = dilithium3::detached_sign(message, &sk);
                Ok(PqcSignature {
                    algorithm: keypair.algorithm,
                    signature: sig.as_bytes().to_vec(),
                })
            }
            PqcAlgorithm::MlDsa87 => {
                let sk = dilithium5::SecretKey::from_bytes(&keypair.secret_key)
                    .map_err(|e| PqcError::Signing(format!("{:?}", e)))?;
                let sig = dilithium5::detached_sign(message, &sk);
                Ok(PqcSignature {
                    algorithm: keypair.algorithm,
                    signature: sig.as_bytes().to_vec(),
                })
            }
            _ => Err(PqcError::Signing("Not a signature algorithm".into())),
        }
    }
    
    /// Verify a signature
    #[cfg(feature = "post-quantum")]
    pub fn verify(&self, public_key: &[u8], message: &[u8], signature: &PqcSignature) -> PqcResult<bool> {
        use pqcrypto_dilithium::{dilithium3, dilithium5};
        use pqcrypto_traits::sign::*;
        
        match signature.algorithm {
            PqcAlgorithm::MlDsa65 => {
                let pk = dilithium3::PublicKey::from_bytes(public_key)
                    .map_err(|e| PqcError::Verification(format!("{:?}", e)))?;
                let sig = dilithium3::DetachedSignature::from_bytes(&signature.signature)
                    .map_err(|e| PqcError::Verification(format!("{:?}", e)))?;
                Ok(dilithium3::verify_detached_signature(&sig, message, &pk).is_ok())
            }
            PqcAlgorithm::MlDsa87 => {
                let pk = dilithium5::PublicKey::from_bytes(public_key)
                    .map_err(|e| PqcError::Verification(format!("{:?}", e)))?;
                let sig = dilithium5::DetachedSignature::from_bytes(&signature.signature)
                    .map_err(|e| PqcError::Verification(format!("{:?}", e)))?;
                Ok(dilithium5::verify_detached_signature(&sig, message, &pk).is_ok())
            }
            _ => Err(PqcError::Verification("Not a signature algorithm".into())),
        }
    }
    
    // Stub implementations when feature is disabled
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn generate_kem_keypair(&self) -> PqcResult<PqcKeyPair> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn generate_kem_keypair_with(&self, _algorithm: PqcAlgorithm) -> PqcResult<PqcKeyPair> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn encapsulate(&self, _recipient_pk: &PqcKeyPair) -> PqcResult<PqcEncapsulation> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn decapsulate(&self, _keypair: &PqcKeyPair, _ciphertext: &[u8]) -> PqcResult<Vec<u8>> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn generate_sig_keypair(&self) -> PqcResult<PqcKeyPair> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn generate_sig_keypair_with(&self, _algorithm: PqcAlgorithm) -> PqcResult<PqcKeyPair> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn sign(&self, _keypair: &PqcKeyPair, _message: &[u8]) -> PqcResult<PqcSignature> {
        Err(PqcError::FeatureDisabled)
    }
    
    #[cfg(not(feature = "post-quantum"))]
    pub fn verify(&self, _public_key: &[u8], _message: &[u8], _signature: &PqcSignature) -> PqcResult<bool> {
        Err(PqcError::FeatureDisabled)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_algorithm_properties() {
        assert!(PqcAlgorithm::MlKem768.is_kem());
        assert!(!PqcAlgorithm::MlKem768.is_signature());
        assert!(PqcAlgorithm::MlDsa65.is_signature());
        assert!(!PqcAlgorithm::MlDsa65.is_kem());
        assert_eq!(PqcAlgorithm::MlKem768.security_level(), 3);
        assert_eq!(PqcAlgorithm::MlDsa87.security_level(), 5);
    }
    
    #[test]
    fn test_provider_defaults() {
        let provider = PqcProvider::new();
        assert_eq!(provider.default_kem, PqcAlgorithm::MlKem768);
        assert_eq!(provider.default_sig, PqcAlgorithm::MlDsa65);
        
        let max_provider = PqcProvider::max_security();
        assert_eq!(max_provider.default_kem, PqcAlgorithm::MlKem1024);
        assert_eq!(max_provider.default_sig, PqcAlgorithm::MlDsa87);
    }
    
    #[cfg(feature = "post-quantum")]
    #[test]
    fn test_kem_roundtrip() {
        let provider = PqcProvider::new();
        let keypair = provider.generate_kem_keypair().expect("keygen");
        
        let encap = provider.encapsulate(&keypair).expect("encapsulate");
        let decap = provider.decapsulate(&keypair, &encap.ciphertext).expect("decapsulate");
        
        assert_eq!(encap.shared_secret, decap);
    }
    
    #[cfg(feature = "post-quantum")]
    #[test]
    fn test_signature_roundtrip() {
        let provider = PqcProvider::new();
        let keypair = provider.generate_sig_keypair().expect("keygen");
        let message = b"BIZRA Ihsan: Excellence in every computation";
        
        let signature = provider.sign(&keypair, message).expect("sign");
        let valid = provider.verify(&keypair.public_key, message, &signature).expect("verify");
        
        assert!(valid);
    }
    
    #[cfg(feature = "post-quantum")]
    #[test]
    fn test_signature_fails_on_tamper() {
        let provider = PqcProvider::new();
        let keypair = provider.generate_sig_keypair().expect("keygen");
        let message = b"Original message";
        let tampered = b"Tampered message";
        
        let signature = provider.sign(&keypair, message).expect("sign");
        let valid = provider.verify(&keypair.public_key, tampered, &signature).expect("verify");
        
        assert!(!valid);
    }
}
