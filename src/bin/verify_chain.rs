// src/bin/verify_chain.rs - Chain Verification CLI
//
// PEAK MASTERPIECE v7.1: Priority 0 Implementation
// Evidence-Based Review: "Add a chain verifier CLI that checks all receipts"
//
// Usage:
//   cargo run --bin verify_chain -- [OPTIONS] <RECEIPTS_DIR>
//
// Options:
//   --genesis <FILE>    Path to genesis receipt file
//   --registry <FILE>   Path to identity registry file
//   --verbose          Show detailed verification output
//   --json             Output results as JSON
//
// Exit codes:
//   0 = All receipts verified successfully
//   1 = Verification failures detected
//   2 = Error (missing files, parse errors, etc.)

use anyhow::{Context, Result};
use bizra_jcs::{compute_digest, compute_payload_id};
use clap::Parser;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use meta_alpha_dual_agentic::executor::ThoughtExecReceipt;
use meta_alpha_dual_agentic::genesis::{
    ChainVerificationFailure, ChainVerificationResult, GenesisReceipt, IdentityRegistry,
};
use std::path::PathBuf;
use std::process::ExitCode;
use std::{cmp::Ordering, fs};

/// BIZRA Genesis Chain Verifier
///
/// Validates receipt chain integrity, signatures, and identity bindings.
#[derive(Parser, Debug)]
#[command(name = "verify_chain")]
#[command(author = "BIZRA Genesis Team")]
#[command(version = env!("CARGO_PKG_VERSION"))]
#[command(about = "Verify receipt chain integrity and signatures")]
struct Args {
    /// Directory containing receipt JSON files
    #[arg(required = true)]
    receipts_dir: PathBuf,

    /// Path to genesis receipt file
    #[arg(short, long)]
    genesis: Option<PathBuf>,

    /// Path to identity registry YAML file
    #[arg(short = 'r', long)]
    registry: Option<PathBuf>,

    /// Show detailed verification output
    #[arg(short, long)]
    verbose: bool,

    /// Output results as JSON
    #[arg(long)]
    json: bool,
}

fn main() -> ExitCode {
    let args = Args::parse();

    match run_verification(&args) {
        Ok(success) => {
            if success {
                ExitCode::SUCCESS
            } else {
                ExitCode::from(1)
            }
        }
        Err(e) => {
            eprintln!("Error: {:#}", e);
            ExitCode::from(2)
        }
    }
}

fn run_verification(args: &Args) -> Result<bool> {
    let mut result = ChainVerificationResult {
        total_receipts: 0,
        verified: 0,
        failures: vec![],
        genesis_valid: false,
        chain_continuous: true,
        signatures_valid: true,
    };

    // Load genesis if provided
    let mut genesis: Option<GenesisReceipt> = None;
    if let Some(genesis_path) = &args.genesis {
        let loaded = GenesisReceipt::load(genesis_path)
            .with_context(|| format!("Failed to load genesis from {:?}", genesis_path))?;

        if args.verbose {
            println!("📜 Genesis Receipt Loaded:");
            println!("   ID: {}", loaded.genesis_id);
            println!("   Policy Hash: {}...", &loaded.policy_hash[..16]);
            println!("   Node Fingerprint: {}...", &loaded.node_fingerprint[..16]);
            println!("   Chain Root: {}...", &loaded.chain_root[..16]);
        }

        match loaded.verify() {
            Ok(true) => result.genesis_valid = true,
            Ok(false) => {
                result.genesis_valid = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: loaded.genesis_id.clone(),
                    reason: "Genesis signature invalid".to_string(),
                    expected: None,
                    actual: None,
                });
            }
            Err(e) => {
                result.genesis_valid = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: loaded.genesis_id.clone(),
                    reason: format!("Genesis verification error: {}", e),
                    expected: None,
                    actual: None,
                });
            }
        }

        genesis = Some(loaded);
    }

    // Load identity registry if provided
    let mut registry: Option<IdentityRegistry> = None;
    if let Some(registry_path) = &args.registry {
        let registry_str = registry_path
            .to_str()
            .unwrap_or("constitution/identity_registry.yaml");
        let loaded = IdentityRegistry::load(registry_str)
            .with_context(|| format!("Failed to load registry from {:?}", registry_path))?;

        if args.verbose {
            println!("🔐 Identity Registry Loaded:");
            println!("   Nodes: {}", loaded.nodes.len());
            println!("   Agents: {}", loaded.agents.len());
        }

        registry = Some(loaded);
    }

    // Verify directory
    if args.verbose {
        println!("\n🔍 Verifying receipts in: {:?}", args.receipts_dir);
    }

    let mut chain_receipts: Vec<(String, ThoughtExecReceipt)> = vec![];
    let mut legacy_receipts: Vec<(String, serde_json::Value)> = vec![];

    for entry in fs::read_dir(&args.receipts_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.extension().map(|e| e == "json").unwrap_or(false) {
            continue;
        }

        let filename = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Skip genesis files (handled separately)
        if filename.starts_with("GENESIS") {
            continue;
        }

        match fs::read_to_string(&path) {
            Ok(content) => {
                if let Ok(receipt) = serde_json::from_str::<ThoughtExecReceipt>(&content) {
                    chain_receipts.push((filename, receipt));
                } else {
                    match serde_json::from_str::<serde_json::Value>(&content) {
                        Ok(json) => legacy_receipts.push((filename, json)),
                        Err(e) => {
                            result.failures.push(ChainVerificationFailure {
                                receipt_id: filename,
                                reason: format!("JSON parse error: {}", e),
                                expected: None,
                                actual: None,
                            });
                        }
                    }
                }
            }
            Err(e) => {
                result.failures.push(ChainVerificationFailure {
                    receipt_id: filename,
                    reason: format!("Read error: {}", e),
                    expected: None,
                    actual: None,
                });
            }
        }
    }

    result.total_receipts = chain_receipts.len() + legacy_receipts.len();

    // Verify legacy receipts with integrity_hash if present
    for (filename, json) in &legacy_receipts {
        if let Some(integrity_hash) = json.get("integrity_hash").and_then(|v| v.as_str()) {
            let mut json_copy = json.clone();
            if let Some(obj) = json_copy.as_object_mut() {
                obj.remove("integrity_hash");
            }

            let canonical = serde_json::to_string(&json_copy).unwrap_or_default();
            let computed_hash = sha256_hex(canonical.as_bytes());

            if computed_hash == integrity_hash {
                result.verified += 1;
            } else {
                result.signatures_valid = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: filename.clone(),
                    reason: "Integrity hash mismatch".to_string(),
                    expected: Some(integrity_hash.to_string()),
                    actual: Some(computed_hash),
                });
            }
        } else {
            // Legacy receipt without integrity hash
            result.verified += 1;
        }
    }

    // Verify chain receipts
    chain_receipts.sort_by(|a, b| {
        let a_ts = a.1.payload.timestamp;
        let b_ts = b.1.payload.timestamp;
        if a_ts == b_ts {
            a.1.payload_id.cmp(&b.1.payload_id)
        } else if a_ts < b_ts {
            Ordering::Less
        } else {
            Ordering::Greater
        }
    });

    let mut expected_prev = genesis.as_ref().map(|g| g.chain_root.clone());

    for (filename, receipt) in &chain_receipts {
        let mut ok = true;

        let payload_id = match compute_payload_id(&receipt.payload) {
            Ok(id) => id,
            Err(e) => {
                ok = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: filename.clone(),
                    reason: format!("JCS payload_id error: {}", e),
                    expected: None,
                    actual: None,
                });
                String::new()
            }
        };
        if !payload_id.is_empty() && payload_id != receipt.payload_id {
            ok = false;
            result.failures.push(ChainVerificationFailure {
                receipt_id: filename.clone(),
                reason: "Payload ID mismatch".to_string(),
                expected: Some(receipt.payload_id.clone()),
                actual: Some(payload_id),
            });
        }

        let digest: Option<[u8; 32]> = match compute_digest(&receipt.payload) {
            Ok(digest) => Some(digest),
            Err(e) => {
                ok = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: filename.clone(),
                    reason: format!("JCS digest error: {}", e),
                    expected: None,
                    actual: None,
                });
                None
            }
        };
        if let Some(digest) = digest {
            let computed_hash = hex::encode(digest);
            if computed_hash != receipt.receipt_hash {
                ok = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: filename.clone(),
                    reason: "Receipt hash mismatch".to_string(),
                    expected: Some(receipt.receipt_hash.clone()),
                    actual: Some(computed_hash),
                });
            }
        }

        if let Some(ref expected) = expected_prev {
            if receipt.payload.prev_hash != *expected {
                ok = false;
                result.chain_continuous = false;
                result.failures.push(ChainVerificationFailure {
                    receipt_id: filename.clone(),
                    reason: "prev_hash mismatch".to_string(),
                    expected: Some(expected.clone()),
                    actual: Some(receipt.payload.prev_hash.clone()),
                });
            }
        } else {
            expected_prev = Some(receipt.payload.prev_hash.clone());
        }

        // Signature verification against identity registry
        if receipt.signatures.is_empty() {
            ok = false;
            result.signatures_valid = false;
            result.failures.push(ChainVerificationFailure {
                receipt_id: filename.clone(),
                reason: "Receipt has no signatures".to_string(),
                expected: None,
                actual: None,
            });
        } else if let Some(ref reg) = registry {
            for sig in &receipt.signatures {
                let node = match reg.nodes.get(&sig.signer_id) {
                    Some(node) => node,
                    None => {
                        ok = false;
                        result.signatures_valid = false;
                        result.failures.push(ChainVerificationFailure {
                            receipt_id: filename.clone(),
                            reason: format!("Unknown signer_id: {}", sig.signer_id),
                            expected: None,
                            actual: None,
                        });
                        continue;
                    }
                };

                if !node.trusted {
                    ok = false;
                    result.signatures_valid = false;
                    result.failures.push(ChainVerificationFailure {
                        receipt_id: filename.clone(),
                        reason: format!("Untrusted signer_id: {}", sig.signer_id),
                        expected: None,
                        actual: None,
                    });
                    continue;
                }

                let digest_bytes = match digest {
                    Some(d) => d,
                    None => {
                        ok = false;
                        result.signatures_valid = false;
                        result.failures.push(ChainVerificationFailure {
                            receipt_id: filename.clone(),
                            reason: "Signature verification skipped (invalid digest)".to_string(),
                            expected: None,
                            actual: None,
                        });
                        continue;
                    }
                };

                let pk_bytes = hex::decode(&node.public_key)?;
                let pk = VerifyingKey::try_from(pk_bytes.as_slice())?;
                let sig_bytes = hex::decode(&sig.value_hex)?;
                let signature = Signature::try_from(sig_bytes.as_slice())?;

                if pk.verify(&digest_bytes, &signature).is_err() {
                    ok = false;
                    result.signatures_valid = false;
                    result.failures.push(ChainVerificationFailure {
                        receipt_id: filename.clone(),
                        reason: "Signature verification failed".to_string(),
                        expected: None,
                        actual: None,
                    });
                }
            }
        } else {
            ok = false;
            result.signatures_valid = false;
            result.failures.push(ChainVerificationFailure {
                receipt_id: filename.clone(),
                reason: "Identity registry required for signature verification".to_string(),
                expected: None,
                actual: None,
            });
        }

        if ok {
            result.verified += 1;
            expected_prev = Some(receipt.receipt_hash.clone());
        } else if expected_prev.is_some() {
            expected_prev = Some(receipt.receipt_hash.clone());
        }
    }

    // Output results
    if args.json {
        let json_result = serde_json::json!({
            "total_receipts": result.total_receipts,
            "verified": result.verified,
            "failures": result.failures.len(),
            "genesis_valid": result.genesis_valid,
            "chain_continuous": result.chain_continuous,
            "signatures_valid": result.signatures_valid,
            "failure_details": result.failures.iter().map(|f| {
                serde_json::json!({
                    "receipt_id": f.receipt_id,
                    "reason": f.reason,
                    "expected": f.expected,
                    "actual": f.actual,
                })
            }).collect::<Vec<_>>(),
        });
        println!("{}", serde_json::to_string_pretty(&json_result)?);
    } else {
        println!("\n═══════════════════════════════════════════════════════════");
        println!("             BIZRA CHAIN VERIFICATION REPORT");
        println!("═══════════════════════════════════════════════════════════\n");

        println!("📊 Summary:");
        println!("   Total Receipts:    {}", result.total_receipts);
        println!("   Verified:          {}", result.verified);
        println!("   Failures:          {}", result.failures.len());

        println!("\n🔒 Integrity Checks:");
        println!(
            "   Genesis Valid:     {}",
            status_icon(result.genesis_valid)
        );
        println!(
            "   Chain Continuous:  {}",
            status_icon(result.chain_continuous)
        );
        println!(
            "   Signatures Valid:  {}",
            status_icon(result.signatures_valid)
        );

        if !result.failures.is_empty() {
            println!("\n❌ Failures:");
            for failure in &result.failures {
                println!("   - {}: {}", failure.receipt_id, failure.reason);
                if let (Some(expected), Some(actual)) = (&failure.expected, &failure.actual) {
                    if args.verbose {
                        println!("     Expected: {}...", &expected[..expected.len().min(32)]);
                        println!("     Actual:   {}...", &actual[..actual.len().min(32)]);
                    }
                }
            }
        }

        println!("\n═══════════════════════════════════════════════════════════");

        if result.failures.is_empty() && result.verified == result.total_receipts {
            println!("✅ ALL RECEIPTS VERIFIED SUCCESSFULLY");
        } else {
            println!("⚠️  VERIFICATION INCOMPLETE - SEE FAILURES ABOVE");
        }

        println!("═══════════════════════════════════════════════════════════\n");
    }

    // Return success if no failures
    Ok(result.failures.is_empty() && result.verified == result.total_receipts)
}

fn status_icon(status: bool) -> &'static str {
    if status {
        "✅ PASS"
    } else {
        "❌ FAIL"
    }
}

fn sha256_hex(data: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}
