
use anyhow::{anyhow, Context, Result};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use clap::{Parser, Subcommand};
use ed25519_dalek::{Signature, SigningKey, VerifyingKey, Signer, Verifier};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use chrono::{DateTime, Utc};

#[derive(Parser)]
#[command(name = "bizra-verify-receipt", version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Version,
    Canonicalize { #[arg(long)] file: String },
    PayloadId { #[arg(long)] file: String },
    Sign {
        #[arg(long)] file: String,
        #[arg(long)] key: String,
        #[arg(long)] signer: String,
    },
    Verify {
        #[arg(long)] file: String,
        #[arg(long)] pubkey: Option<String>,
    },
    HashEvidence {
        #[arg(long)] dir: String,
        #[arg(long, default_value_t = false)] write_manifest: bool,
    },
    VerifyEvidence { #[arg(long)] dir: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SigEntry {
    pub signer_id: String,
    pub algorithm: String,
    pub value: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Receipt {
    #[serde(rename = "@context")]
    pub context: String,
    pub receipt_id: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub timestamp: String,
    pub evidence_hash: String,
    pub signatures: Vec<SigEntry>,
    pub metadata: Value,
}

fn canonicalize_jcs(v: &Value) -> Result<Vec<u8>> {
    serde_jcs::to_vec(v).map_err(|e| anyhow!("JCS Error: {}", e))
}

fn compute_receipt_id(payload: &Value) -> Result<String> {
    let canon = canonicalize_jcs(payload)?;
    let mut h = Sha256::new();
    h.update(&canon);
    let digest = h.finalize();
    Ok(format!("rec_{}", URL_SAFE_NO_PAD.encode(digest)))
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Version => println!("bizra-verify-receipt 1.0.0"),
        Commands::Canonicalize { file } => {
            let v: Value = serde_json::from_str(&fs::read_to_string(&file)?)?;
            let c = canonicalize_jcs(&v)?;
            std::io::stdout().write_all(&c)?;
        },
        Commands::PayloadId { file } => {
            let v: Value = serde_json::from_str(&fs::read_to_string(&file)?)?;
            // Remove sigs/id if present for calculation
            let mut p = v.clone();
            if let Value::Object(ref mut m) = p {
                m.remove("receipt_id");
                m.remove("signatures");
            }
            println!("{}", compute_receipt_id(&p)?);
        },
        Commands::Sign { file, key, signer } => {
            let v: Value = serde_json::from_str(&fs::read_to_string(&file)?)?;
            let mut payload = v.clone();
            if let Value::Object(ref mut m) = payload {
                m.remove("receipt_id");
                m.remove("signatures");
            }
            let canon = canonicalize_jcs(&payload)?;

            let pem = fs::read_to_string(&key)?;
            let sk = SigningKey::from_pkcs8_pem(&pem).map_err(|e| anyhow!("Invalid Key: {}", e))?;
            let sig = sk.sign(&canon);

            let mut receipt: Receipt = serde_json::from_value(v)?;
            receipt.signatures.push(SigEntry {
                signer_id: signer,
                algorithm: "ED25519".to_string(),
                value: URL_SAFE_NO_PAD.encode(sig.to_bytes()),
                timestamp: Utc::now().to_rfc3339(),
            });
            fs::write(&file, serde_json::to_string_pretty(&receipt)?)?;
            println!("Signed.");
        },
        Commands::Verify { file, pubkey } => {
            let v: Value = serde_json::from_str(&fs::read_to_string(&file)?)?;
            let receipt: Receipt = serde_json::from_value(v.clone())?;

            // Verify ID
            let mut payload = v.clone();
            if let Value::Object(ref mut m) = payload {
                m.remove("receipt_id");
                m.remove("signatures");
            }
            let calc_id = compute_receipt_id(&payload)?;
            if calc_id != receipt.receipt_id {
                return Err(anyhow!("Receipt ID mismatch"));
            }

            // Verify Sigs if key provided
            if let Some(pk_path) = pubkey {
                let pem = fs::read_to_string(pk_path)?;
                let pk = VerifyingKey::from_public_key_pem(&pem).map_err(|e| anyhow!("Invalid PubKey: {}", e))?;
                let canon = canonicalize_jcs(&payload)?;
                for sig in &receipt.signatures {
                    if sig.algorithm == "ED25519" {
                        let sig_bytes = URL_SAFE_NO_PAD.decode(&sig.value)?;
                        let signature = Signature::from_bytes(sig_bytes.as_slice().try_into().map_err(|_| anyhow!("Invalid signature length"))?);
                        pk.verify(&canon, &signature).context("Signature verification failed")?;
                    }
                }
            }
            println!("VERIFIED: {}", receipt.receipt_id);
        },
        Commands::HashEvidence { dir, write_manifest } => {
            // Simple hash-evidence implementation
            let mut entries = Vec::new();
            let path = Path::new(&dir);
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let p = entry.path();
                if p.is_file() {
                    let content = fs::read(&p)?;
                    let mut h = Sha256::new();
                    h.update(&content);
                    let sha = format!("{:x}", h.finalize());
                    entries.push(json!({
                        "path": p.file_name().unwrap().to_str().unwrap(),
                        "sha256": sha,
                        "size_bytes": content.len()
                    }));
                }
            }
            let manifest = json!({
                "schema_version": "evidencepack/v1",
                "created_at": Utc::now().to_rfc3339(),
                "files": entries
            });
            let manifest_json = serde_json::to_string_pretty(&manifest)?;
            let mut h = Sha256::new();
            h.update(manifest_json.as_bytes());
            let final_hash = format!("{:x}", h.finalize());
            if write_manifest {
                fs::write(path.join("evidence_manifest.json"), manifest_json)?;
            }
            println!("{}", final_hash);
        },
        _ => println!("Command not implemented.")
    }
    Ok(())
}
