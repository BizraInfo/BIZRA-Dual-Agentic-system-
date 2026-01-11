use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct GenesisState {
    pub identity_hash: String,
    pub schema_version: String,
    pub api_contract_version: String,
    pub migrations_manifest_hash: String,
}

pub struct GenesisAnchor;

impl GenesisAnchor {
    pub fn calculate_hash(
        identity_path: &Path,
        migrations_path: &Path,
        package_path: &Path,
    ) -> anyhow::Result<String> {
        let mut hasher = Sha256::new();

        // 1. Identity Manifest
        let identity = fs::read_to_string(identity_path)?;
        hasher.update(identity.as_bytes());

        // 2. Database Schema (latest migration hash)
        // For simplicity, we hash the migration directory listing or the latest file
        let mut migrations: Vec<_> = fs::read_dir(migrations_path)?
            .filter_map(|e| e.ok())
            .map(|e| e.path())
            .filter(|p| p.is_file() && p.extension().map_or(false, |ext| ext == "sql"))
            .collect();
        migrations.sort();

        for mig in migrations {
            let content = fs::read(mig)?;
            hasher.update(&content);
        }

        // 3. API Contract (package.json version)
        let package = fs::read_to_string(package_path)?;
        hasher.update(package.as_bytes());

        let result = hasher.finalize();
        Ok(format!("{:x}", result))
    }

    pub fn get_canonical_hash() -> String {
        // As per Gate 1 Reconciliation: Normalized to the verified manifest hash
        "8c5ee15603b937c4e4556ebf25ada33f92023b661582ac977a8b2c75a2872580".to_string()
    }

    pub fn verify(current_hash: &str) -> bool {
        current_hash == Self::get_canonical_hash()
    }
}
