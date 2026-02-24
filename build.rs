//! BIZRA Build Script
//! Computes constitutional genesis hash at compile time and embeds it into binary.
//! This creates a cryptographic binding between the binary and its constitutional contracts.

use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=contracts/");
    println!("cargo:rerun-if-changed=build.rs");

    // Compute constitutional genesis hash
    let genesis_hash = compute_genesis_hash();

    // Emit as compile-time environment variable
    println!("cargo:rustc-env=BIZRA_GENESIS_HASH={}", genesis_hash);

    // Also check for CI-provided hash override
    if let Ok(ci_hash) = env::var("BIZRA_GENESIS_HASH") {
        if ci_hash != genesis_hash {
            println!(
                "cargo:warning=Constitutional hash mismatch! CI: {} vs Local: {}",
                ci_hash, genesis_hash
            );
            // In strict mode, this would be a compile error
            // For now, we warn and use the computed hash
        }
    }

    println!("cargo:warning=BIZRA Genesis Hash: {}", genesis_hash);
}

/// Computes deterministic SHA-256 hash of all constitutional contracts.
/// Uses BTreeMap for deterministic ordering across platforms.
fn compute_genesis_hash() -> String {
    use sha2::{Digest, Sha256};

    let contracts_dir = Path::new("contracts");

    // Collect all contract files in deterministic order
    let mut files: BTreeMap<String, Vec<u8>> = BTreeMap::new();

    if contracts_dir.exists() {
        collect_files(contracts_dir, &mut files);
    }

    // Compute hash of concatenated contents
    let mut hasher = Sha256::new();

    for (path, contents) in &files {
        // Include path in hash for structural integrity
        hasher.update(path.as_bytes());
        hasher.update(b"\n");
        hasher.update(contents);
        hasher.update(b"\n");
    }

    let result = hasher.finalize();
    hex::encode(result)
}

/// Recursively collects files from directory into BTreeMap for deterministic ordering.
fn collect_files(dir: &Path, files: &mut BTreeMap<String, Vec<u8>>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();

        if path.is_dir() {
            collect_files(&path, files);
        } else if path.is_file() {
            let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");

            // Only include JSON and YAML contract files
            if ext == "json" || ext == "yaml" || ext == "yml" {
                if let Ok(contents) = fs::read(&path) {
                    let relative = path
                        .strip_prefix("contracts")
                        .unwrap_or(&path)
                        .to_string_lossy()
                        .to_string();
                    files.insert(relative, contents);
                }
            }
        }
    }
}
