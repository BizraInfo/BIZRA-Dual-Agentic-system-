use anyhow::{anyhow, Context, Result};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{PasswordHash, PasswordHasher as _, PasswordVerifier as _, SaltString};
use chacha20poly1305::aead::{Aead, KeyInit};
use chacha20poly1305::XChaCha20Poly1305;
use clap::{Parser, Subcommand};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use zeroize::Zeroize;

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────
#[derive(Parser)]
#[command(name="bizra-node0", version="1.0.0", about="BIZRA Node0: Primordial verifier-first bootloader")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    Activate { #[arg(long)] manifest: PathBuf },
    Verify   { #[arg(long)] manifest: PathBuf },
    Run      { #[arg(long)] manifest: PathBuf },
    CheckCanon, // New Elite command
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest
// ─────────────────────────────────────────────────────────────────────────────
#[derive(Debug, Deserialize)]
struct Manifest {
    manifest_version: String,
    node: NodeCfg,
    standing_on_giants: SoTG,
    policy: PolicyCfg,
    replay_guard: ReplayCfg,
    ledger: LedgerCfg,
    performance: PerformanceCfg,
    observability: Option<ObservabilityCfg>,
    policy_bundle: Option<PolicyBundleCfg>,
}

#[derive(Debug, Deserialize)]
struct PerformanceCfg {
    budgets: BudgetsCfg,
}

#[derive(Debug, Deserialize)]
struct BudgetsCfg {
    verify_receipt_max_ms: u64,
    verify_10k_receipts_max_s: u64,
}

#[derive(Debug, Deserialize)]
struct ObservabilityCfg {
    logs: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct PolicyBundleCfg {
    required: bool,
    bundle_path: String,
    root_hash: String,
}

#[derive(Debug, Deserialize)]
struct NodeCfg {
    id: String,
    env: String,
    mode: String,
    data_dir: String,
    ledger_dir: String,
    keys_dir: String,
    registry_path: String,
}

#[derive(Debug, Deserialize)]
struct SoTG {
    canonicalization: CanonCfg,
    crypto: CryptoCfg,
    supply_chain: SupplyCfg,
    compliance: Option<ComplianceCfg>, // Added compliance
}

#[derive(Debug, Deserialize)]
struct ComplianceCfg { sbom: String, slsa_level: u32 }

#[derive(Debug, Deserialize)]
struct CanonCfg { profile: String }
#[derive(Debug, Deserialize)]
struct CryptoCfg { signature: String, hash: String }
#[derive(Debug, Deserialize)]
struct SupplyCfg { lockfile_required: bool, sbom_required: bool, provenance_required: bool }

#[derive(Debug, Deserialize)]
struct PolicyCfg { ihsan_threshold_basis_points: HashMap<String, u64> }

#[derive(Debug, Deserialize)]
struct ReplayCfg { counter: CounterCfg, nonce: NonceCfg }
#[derive(Debug, Deserialize)]
struct CounterCfg { bits: u32, rule: String }
#[derive(Debug, Deserialize)]
struct NonceCfg { enabled: bool }

#[derive(Debug, Deserialize)]
struct LedgerCfg { format: String, append_only: bool, fsync: bool }

// ─────────────────────────────────────────────────────────────────────────────
// Identity Registry
// ─────────────────────────────────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize)]
struct IdentityRegistry {
    version: String,
    policy_hash: String,
    entries: Vec<IdentityEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
struct IdentityEntry {
    agent_id: String,
    pubkey_hex: String,
    status: String, // "active" | "revoked"
}

// ─────────────────────────────────────────────────────────────────────────────
// Receipt
// ─────────────────────────────────────────────────────────────────────────────
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ReceiptUnsigned {
    schema_version: String,
    policy_hash: String,
    agent_id: String,
    session_id: String,
    counter: u128,
    nonce: String,
    timestamp_unix_s: u64,
    payload: serde_json::Value,
    prev_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Receipt {
    unsigned: ReceiptUnsigned,
    hash: String,
    signature_hex: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonicalization: BIZRA-CANON-INT-1
// Strict deterministic subset:
// - Objects sorted lexicographically
// - Arrays preserved
// - Numbers MUST be integers (i64/u64); floats/exponent are forbidden
// NOTE: Upgrade path is RFC8785-JCS once you lock cross-language JCS vectors.
// ─────────────────────────────────────────────────────────────────────────────
fn canonicalize_value(v: &serde_json::Value) -> Result<serde_json::Value> {
    Ok(match v {
        serde_json::Value::Null => serde_json::Value::Null,
        serde_json::Value::Bool(b) => serde_json::Value::Bool(*b),
        serde_json::Value::String(s) => serde_json::Value::String(s.clone()),
        serde_json::Value::Number(n) => {
            // STRICT CHECK: Reject if not an integer.
            if n.is_i64() || n.is_u64() {
                serde_json::Value::Number(n.clone())
            } else {
                // Reject floats/NaN/Infinity
                return Err(anyhow!("CANON LAW VIOLATION: Floating point detected: {}", n));
            }
        }
        serde_json::Value::Array(arr) => {
            let mut out = Vec::with_capacity(arr.len());
            for x in arr { out.push(canonicalize_value(x)?); }
            serde_json::Value::Array(out)
        }
        serde_json::Value::Object(map) => {
             // Enforce lexicographical key sorting via BTreeMap
            let mut bt: BTreeMap<String, serde_json::Value> = BTreeMap::new();
            for (k, val) in map.iter() { bt.insert(k.clone(), canonicalize_value(val)?); }
            // Reconstruct as serde_json::Map (which preserves insertion order)
            // But since we insert from BTreeMap, it is effectively sorted.
            let mut out = serde_json::Map::new();
            for (k, val) in bt { out.insert(k, val); }
            serde_json::Value::Object(out)
        }
    })
}

fn canonical_bytes(v: &serde_json::Value) -> Result<Vec<u8>> {
    let canon = canonicalize_value(v)?;
    Ok(serde_json::to_string(&canon)?.into_bytes())
}

fn sha256_hex(data: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(data);
    hex::encode(h.finalize())
}

fn compute_policy_hash(manifest_yaml: &str) -> Result<String> {
    let v_yaml: serde_yaml::Value = serde_yaml::from_str(manifest_yaml)?;
    // Convert YAML -> JSON value deterministically (serde_yaml -> serde_json via roundtrip).
    let json = serde_json::to_value(v_yaml)?;
    let canon = canonical_bytes(&json)?;
    Ok(sha256_hex(&canon))
}

// receipt_hash = SHA256(prev_hash || canonical(unsigned_receipt))
fn compute_receipt_hash(prev_hash_hex: &str, unsigned: &ReceiptUnsigned) -> Result<String> {
    let unsigned_json = serde_json::to_value(unsigned)?;
    let canon = canonical_bytes(&unsigned_json)?;
    let mut material = Vec::with_capacity(prev_hash_hex.len() + canon.len());
    material.extend_from_slice(prev_hash_hex.as_bytes());
    material.extend_from_slice(&canon);
    Ok(sha256_hex(&material))
}

// ─────────────────────────────────────────────────────────────────────────────
// Encrypted key-at-rest (Argon2id + XChaCha20-Poly1305)
// File format: "BIZRAKEY1" | salt(16) | nonce(24) | ciphertext(...)
// ─────────────────────────────────────────────────────────────────────────────
const KEY_MAGIC: &[u8; 9] = b"BIZRAKEY1";

fn derive_aead_key(passphrase: &str, salt: &[u8]) -> Result<[u8; 32]> {
    // Argon2id via password-hash crate interface
    let salt_str = SaltString::encode_b64(salt).map_err(|_| anyhow!("salt encode"))?;
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(passphrase.as_bytes(), &salt_str)
        .map_err(|_| anyhow!("argon2 hash failed"))?
        .to_string();

    let parsed = PasswordHash::new(&hash).map_err(|_| anyhow!("password hash parse"))?;
    // Derive 32 bytes by hashing the PHC string (simple, deterministic); replace with HKDF if desired.
    let mut h = Sha256::new();
    h.update(parsed.to_string().as_bytes());
    let out = h.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&out[..32]);
    Ok(key)
}

fn load_or_create_signing_key(keys_dir: &Path, passphrase: &str) -> Result<SigningKey> {
    fs::create_dir_all(keys_dir)?;
    let path = keys_dir.join("node0_ed25519.sk.enc");

    if path.exists() {
        let blob = fs::read(&path)?;
        if blob.len() < 9 + 16 + 24 { return Err(anyhow!("key blob too short")); }
        if &blob[..9] != KEY_MAGIC { return Err(anyhow!("bad key magic")); }

        let salt = &blob[9..25];
        let nonce = &blob[25..49];
        let ciphertext = &blob[49..];

        let key = derive_aead_key(passphrase, salt)?;
        let aead = XChaCha20Poly1305::new((&key).into());
        let plaintext = aead.decrypt(nonce.into(), ciphertext)
            .map_err(|_| anyhow!("key decrypt failed"))?;

        if plaintext.len() != 32 { return Err(anyhow!("bad secret length")); }
        let mut sk_bytes = [0u8; 32];
        sk_bytes.copy_from_slice(&plaintext);
        let sk = SigningKey::from_bytes(&sk_bytes);
        
        // Zeroize secret key bytes from stack
        sk_bytes.zeroize();

        // wipe plaintext
        let mut pt = plaintext;
        pt.zeroize();
        Ok(sk)
    } else {
        let sk = SigningKey::generate(&mut OsRng);
        let mut sk_bytes = sk.to_bytes();

        let mut salt = [0u8; 16];
        let mut nonce = [0u8; 24];
        OsRng.fill_bytes(&mut salt);
        OsRng.fill_bytes(&mut nonce);

        let key = derive_aead_key(passphrase, &salt)?;
        let aead = XChaCha20Poly1305::new((&key).into());
        let ciphertext = aead.encrypt((&nonce).into(), sk_bytes.as_slice())
            .map_err(|_| anyhow!("key encrypt failed"))?;

        // Zeroize secret key bytes from stack after encryption
        sk_bytes.zeroize();

        let mut out = Vec::with_capacity(9 + 16 + 24 + ciphertext.len());
        out.extend_from_slice(KEY_MAGIC);
        out.extend_from_slice(&salt);
        out.extend_from_slice(&nonce);
        out.extend_from_slice(&ciphertext);

        fs::write(&path, out)?;
        Ok(sk)
    }
}

fn sign_hex(sk: &SigningKey, msg: &[u8]) -> String {
    let sig: Signature = sk.sign(msg);
    hex::encode(sig.to_bytes())
}

fn verify_sig(vk: &VerifyingKey, msg: &[u8], sig_hex: &str) -> Result<()> {
    let sig_bytes = hex::decode(sig_hex)?;
    let sig = Signature::from_slice(&sig_bytes).map_err(|_| anyhow!("bad signature bytes"))?;
    vk.verify(msg, &sig).map_err(|_| anyhow!("signature verification failed"))?;
    Ok(())
}

fn parse_vk_hex(s: &str) -> Result<VerifyingKey> {
    let b = hex::decode(s)?;
    if b.len() != 32 { return Err(anyhow!("invalid pubkey length")); }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&b);
    VerifyingKey::from_bytes(&arr).map_err(|e| anyhow!("invalid pubkey bytes: {}", e))
}

// ─────────────────────────────────────────────────────────────────────────────
// FS helpers
// ─────────────────────────────────────────────────────────────────────────────
fn now_unix_s() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs()
}

fn ensure_dirs(m: &Manifest) -> Result<()> {
    fs::create_dir_all(&m.node.data_dir)?;
    fs::create_dir_all(&m.node.ledger_dir)?;
    fs::create_dir_all(&m.node.keys_dir)?;
    Ok(())
}

fn ledger_tail_path(m: &Manifest) -> PathBuf { Path::new(&m.node.data_dir).join("ledger_tail.txt") }

fn read_tail(m: &Manifest) -> Result<String> {
    let p = ledger_tail_path(m);
    if p.exists() { Ok(fs::read_to_string(p)?.trim().to_string()) } else { Ok("GENESIS".to_string()) }
}
fn write_tail(m: &Manifest, hash: &str) -> Result<()> {
    fs::write(ledger_tail_path(m), format!("{hash}\n"))?;
    Ok(())
}

fn receipt_path(m: &Manifest, counter: u128) -> PathBuf {
    Path::new(&m.node.ledger_dir).join(format!("{counter:032}.json"))
}

fn write_receipt(m: &Manifest, r: &Receipt) -> Result<()> {
    let bytes = serde_json::to_vec_pretty(r)?;
    fs::write(receipt_path(m, r.unsigned.counter), bytes)?;
    Ok(())
}

/// Scan ledger directory for highest existing receipt counter.
/// Returns 0 if no receipts exist (genesis not yet written).
fn get_last_counter(m: &Manifest) -> Result<u128> {
    let ledger_dir = Path::new(&m.node.ledger_dir);
    if !ledger_dir.exists() {
        return Ok(0);
    }
    let mut max_counter: u128 = 0;
    for entry in fs::read_dir(ledger_dir)? {
        let entry = entry?;
        let fname = entry.file_name();
        let fname_str = fname.to_string_lossy();
        // Receipt files are named like: 00000000000000000000000000000001.json
        if fname_str.ends_with(".json") {
            if let Some(stem) = fname_str.strip_suffix(".json") {
                if let Ok(counter) = stem.parse::<u128>() {
                    max_counter = max_counter.max(counter);
                }
            }
        }
    }
    Ok(max_counter)
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry + verifier
// ─────────────────────────────────────────────────────────────────────────────
fn write_registry(m: &Manifest, policy_hash: &str, vk: &VerifyingKey) -> Result<()> {
    let reg = IdentityRegistry {
        version: "1.0".to_string(),
        policy_hash: policy_hash.to_string(),
        entries: vec![IdentityEntry{
            agent_id: m.node.id.clone(),
            pubkey_hex: hex::encode(vk.to_bytes()),
            status: "active".to_string(),
        }],
    };
    fs::write(&m.node.registry_path, serde_json::to_vec_pretty(&reg)?)?;
    Ok(())
}

fn load_registry(path: &Path) -> Result<IdentityRegistry> {
    Ok(serde_json::from_slice(&fs::read(path)?)?)
}

fn verify_ledger(m: &Manifest, policy_hash: &str) -> Result<()> {
    let reg = load_registry(Path::new(&m.node.registry_path))
        .with_context(|| "missing identity registry")?;
    if reg.policy_hash != policy_hash { return Err(anyhow!("registry policy_hash mismatch")); }

    let mut keys: HashMap<String, VerifyingKey> = HashMap::new();
    for e in reg.entries.iter() {
        if e.status == "active" {
            keys.insert(e.agent_id.clone(), parse_vk_hex(&e.pubkey_hex)?);
        }
    }

    let mut files: Vec<PathBuf> = fs::read_dir(&m.node.ledger_dir)?
        .filter_map(|e| e.ok().map(|x| x.path()))
        .filter(|p| p.extension().map(|x| x == "json").unwrap_or(false))
        .collect();
    files.sort();

    let mut prev_hash = "GENESIS".to_string();
    let mut last_counter: Option<u128> = None;
    let mut seen_nonces: BTreeSet<String> = BTreeSet::new();

    for f in files {
        let start = std::time::Instant::now();
        let r: Receipt = serde_json::from_slice(&fs::read(&f)?)?;

        if r.unsigned.policy_hash != policy_hash { return Err(anyhow!("policy_hash mismatch: {}", f.display())); }

        if let Some(lc) = last_counter {
            if r.unsigned.counter <= lc { return Err(anyhow!("counter not strictly increasing: {}", f.display())); }
        }
        last_counter = Some(r.unsigned.counter);

        if !seen_nonces.insert(r.unsigned.nonce.clone()) {
            return Err(anyhow!("replay nonce detected: {}", f.display()));
        }

        if r.unsigned.prev_hash != prev_hash {
            return Err(anyhow!("prev_hash mismatch: {}", f.display()));
        }

        let expected = compute_receipt_hash(&r.unsigned.prev_hash, &r.unsigned)?;
        if r.hash != expected { return Err(anyhow!("hash mismatch: {}", f.display())); }

        let vk = keys.get(&r.unsigned.agent_id).ok_or_else(|| anyhow!("unknown agent_id: {}", r.unsigned.agent_id))?;
        let unsigned_json = serde_json::to_value(&r.unsigned)?;
        let canon = canonical_bytes(&unsigned_json)?;
        verify_sig(vk, &canon, &r.signature_hex)?;

        prev_hash = r.hash.clone();
        
        // Performance Budget Check
        let elapsed = start.elapsed();
        if elapsed.as_millis() as u64 > m.performance.budgets.verify_receipt_max_ms {
            eprintln!("WARN: Receipt {} verification exceeded budget: {}ms > {}ms", 
                f.display(), elapsed.as_millis(), m.performance.budgets.verify_receipt_max_ms);
        }
    }
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Activation
// ─────────────────────────────────────────────────────────────────────────────
fn load_manifest(path: &Path) -> Result<(Manifest, String, String)> {
    let raw = fs::read_to_string(path)?;
    let m: Manifest = serde_yaml::from_str(&raw)?;
    if m.node.mode != "fail_closed" {
        return Err(anyhow!("manifest must set node.mode=fail_closed"));
    }
    let policy_hash = compute_policy_hash(&raw)?;
    Ok((m, raw, policy_hash))
}

fn check_canon() -> Result<()> {
    let test_payload = serde_json::json!({"b": 2, "a": 1});
    let hash = compute_receipt_hash("", &ReceiptUnsigned {
        schema_version: "1.0".to_string(),
        policy_hash: "".to_string(),
        agent_id: "".to_string(),
        session_id: "".to_string(),
        counter: 0,
        nonce: "".to_string(),
        timestamp_unix_s: 0,
        payload: test_payload,
        prev_hash: "".to_string(),
    })?;
    // Just verify execution doesn't panic and prints success
    println!("CANON ENGINE: ONLINE. Hash: {}", hash);
    Ok(())
}

fn activate(manifest_path: &Path) -> Result<()> {
    let (m, _raw, policy_hash) = load_manifest(manifest_path)?;
    ensure_dirs(&m)?;

    // passphrase is REQUIRED for prod safety
    let mut pass = std::env::var("BIZRA_KEY_PASSPHRASE").unwrap_or_default();
    if pass.is_empty() && m.node.env == "prod" {
        return Err(anyhow!("BIZRA_KEY_PASSPHRASE is required in prod"));
    }
    if pass.is_empty() { pass = "dev-insecure".to_string(); }

    let sk = load_or_create_signing_key(Path::new(&m.node.keys_dir), &pass)?;
    pass.zeroize();

    write_registry(&m, &policy_hash, &sk.verifying_key())?;

    // GENESIS receipt
    let prev_hash = read_tail(&m)?;
    let unsigned = ReceiptUnsigned {
        schema_version: "1.0".to_string(),
        policy_hash: policy_hash.clone(),
        agent_id: m.node.id.clone(),
        session_id: "genesis".to_string(),
        counter: 1,
        nonce: format!("genesis-{}", now_unix_s()),
        timestamp_unix_s: now_unix_s(),
        payload: serde_json::json!({
            "type": "GENESIS",
            "manifest": manifest_path.display().to_string(),
            "policy_hash": policy_hash,
            "sotg": { "canon": m.standing_on_giants.canonicalization.profile }
        }),
        prev_hash,
    };

    let hash = compute_receipt_hash(&unsigned.prev_hash, &unsigned)?;
    let canon = canonical_bytes(&serde_json::to_value(&unsigned)?)?;
    let sig_hex = sign_hex(&sk, &canon);
    let r = Receipt { unsigned, hash: hash.clone(), signature_hex: sig_hex };

    write_receipt(&m, &r)?;
    write_tail(&m, &hash)?;

    // verifier prime (fails closed)
    verify_ledger(&m, &policy_hash)?;

    println!(r#"{{"event":"ACTIVATED","node":"{}","policy_hash":"{}","genesis_hash":"{}"}}"#, m.node.id, policy_hash, hash);
    Ok(())
}

fn verify_cmd(manifest_path: &Path) -> Result<()> {
    let (m, _raw, policy_hash) = load_manifest(manifest_path)?;
    verify_ledger(&m, &policy_hash)?;
    println!(r#"{{"event":"VERIFIED","node":"{}","policy_hash":"{}"}}"#, m.node.id, policy_hash);
    Ok(())
}

fn run_cmd(manifest_path: &Path) -> Result<()> {
    // Minimal “safe heartbeat” loop: emits receipts but commits no external side effects.
    let (m, _raw, policy_hash) = load_manifest(manifest_path)?;
    verify_ledger(&m, &policy_hash)?;

    let mut pass = std::env::var("BIZRA_KEY_PASSPHRASE").unwrap_or_default();
    if pass.is_empty() {
        // In production mode, require the passphrase - no fallback to dev-insecure
        return Err(anyhow!("BIZRA_KEY_PASSPHRASE environment variable is required. Set it to unlock the signing key."));
    }
    let sk = load_or_create_signing_key(Path::new(&m.node.keys_dir), &pass)?;
    pass.zeroize();

    // Initialize counter by scanning existing receipts
    let mut counter: u128 = get_last_counter(&m)? + 1;
    loop {
        let prev_hash = read_tail(&m)?;
        let unsigned = ReceiptUnsigned {
            schema_version: "1.0".to_string(),
            policy_hash: policy_hash.clone(),
            agent_id: m.node.id.clone(),
            session_id: "runtime".to_string(),
            counter,
            nonce: format!("tick-{}-{}", counter, now_unix_s()),
            timestamp_unix_s: now_unix_s(),
            payload: serde_json::json!({
                "type": "SAFE_NOOP",
                "snr": { "signal": 1, "noise": 0 },
                "note": "fail-closed heartbeat (no side effects)"
            }),
            prev_hash,
        };

        let hash = compute_receipt_hash(&unsigned.prev_hash, &unsigned)?;
        let canon = canonical_bytes(&serde_json::to_value(&unsigned)?)?;
        let sig_hex = sign_hex(&sk, &canon);
        let r = Receipt { unsigned, hash: hash.clone(), signature_hex: sig_hex };

        write_receipt(&m, &r)?;
        write_tail(&m, &hash)?;
        println!(r#"{{"event":"TICK","counter":{},"hash":"{}"}}"#, counter, hash);

        counter += 1;
        std::thread::sleep(std::time::Duration::from_secs(3));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Constraints & Invariants
// ─────────────────────────────────────────────────────────────────────────────
fn validate_constraints(m: &Manifest) -> Result<()> {
    // 1. Compliance Check
    if let Some(comp) = &m.standing_on_giants.compliance {
        if comp.slsa_level < 3 {
             return Err(anyhow!("Compliance Violation: SLSA Level {} < 3", comp.slsa_level));
        }
    }

    // 2. Supply Chain Check
    let sc = &m.standing_on_giants.supply_chain;
    if !sc.provenance_required {
         return Err(anyhow!("Supply Chain Violation: Provenance check disabled"));
    }

    // 3. Crypto Algo Check
    let crypto = &m.standing_on_giants.crypto;
    if crypto.hash != "SHA-256" {
        return Err(anyhow!("Crypto Violation: Hash algo {} != SHA-256", crypto.hash));
    }
    
    // 4. Performance Budget Sanity
    if m.performance.budgets.verify_receipt_max_ms == 0 {
         eprintln!("WARN: Performance budget is 0 (infinite)");
    }

    Ok(())
}

fn verify_policy_bundle(manifest: &Manifest) -> Result<()> {
    if let Some(cfg) = &manifest.policy_bundle {
        if !cfg.required { return Ok(()); }

        let bundle_path = Path::new(&cfg.bundle_path);
        if !bundle_path.exists() {
            return Err(anyhow!("Policy bundle required but not found: {}", cfg.bundle_path));
        }

        let bundle_content = fs::read_to_string(bundle_path)?;
        let bundle_json: serde_json::Value = serde_json::from_str(&bundle_content)?;
        
        let reported_root = bundle_json["bundle_root"].as_str().unwrap_or_default();
        if reported_root != cfg.root_hash {
             return Err(anyhow!("Manifest root hash mismatch. Manifest: {}, Bundle: {}", cfg.root_hash, reported_root));
        }

        let items = bundle_json["items"].as_array().ok_or(anyhow!("Bundle items missing"))?;
        
        struct Item { path: String, hash: String }
        let mut parsed_items = Vec::new();

        for item in items {
            let path = item["path"].as_str().unwrap_or_default();
            let hash = item["hash"].as_str().unwrap_or_default();
            parsed_items.push(Item { path: path.to_string(), hash: hash.to_string() });
        }
        parsed_items.sort_by(|a, b| a.path.cmp(&b.path));

        for item in &parsed_items {
            let p = Path::new(&item.path);
            if !p.exists() {
                 return Err(anyhow!("Bundle file missing: {}", item.path));
            }
            let content = fs::read(p)?;
            let hash = sha256_hex(&content);
            if hash != item.hash {
                return Err(anyhow!("Bundle verification failed for {}: expected {}, got {}", item.path, item.hash, hash));
            }
        }

        let mut concat_str = String::new();
        for item in &parsed_items {
            concat_str.push_str(&item.path);
            concat_str.push(':');
            concat_str.push_str(&item.hash);
            concat_str.push('\n');
        }
        let computed_root = sha256_hex(concat_str.as_bytes());

        if computed_root != cfg.root_hash {
            return Err(anyhow!("Bundle root hash mismatch! Computed: {}, Expected: {}", computed_root, cfg.root_hash));
        }
        
        eprintln!("🔒 Policy Bundle Verified: {}", cfg.root_hash);
    }
    Ok(())
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    
    // CheckCanon does not require manifest
    if let Cmd::CheckCanon = cli.cmd {
        return check_canon();
    }

    // Pre-load manifest to verify bundle strictly before any command execution
    let manifest_path = match &cli.cmd {
        Cmd::Activate { manifest } => manifest,
        Cmd::Verify { manifest } => manifest,
        Cmd::Run { manifest } => manifest,
        Cmd::CheckCanon => unreachable!(),
    };
    let m_str = fs::read_to_string(manifest_path)?;
    let m: Manifest = serde_yaml::from_str(&m_str)?;
    verify_policy_bundle(&m)?;
    validate_constraints(&m)?;

    match cli.cmd {
        Cmd::Activate { manifest } => activate(&manifest),
        Cmd::Verify   { manifest } => verify_cmd(&manifest),
        Cmd::Run      { manifest } => run_cmd(&manifest),
        Cmd::CheckCanon => check_canon(),
    }
}
