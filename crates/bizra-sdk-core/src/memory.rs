use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::sync::{Arc, RwLock}; // Use std::sync::RwLock for simplicity in core, or tokio::sync::RwLock if async needed (SDK core is mostly sync logic for now or wrapped)

/// Interface for node memory/storage.
pub trait MemoryInterface: Send + Sync {
    fn set(&self, key: &str, value: &str) -> Result<()>;
    fn get(&self, key: &str) -> Result<Option<String>>;

    // Apotheosis Upgrade: Identity & Events
    fn get_identity(&self) -> Result<Identity>;
    fn record_event(&self, event: MemoryEvent) -> Result<String>; // Returns hash
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Identity {
    pub user_id: String,
    pub goals: Vec<String>,
    pub constraints: Vec<String>,
}

impl Default for Identity {
    fn default() -> Self {
        Self {
            user_id: "default_user".to_string(),
            goals: vec!["Achieve Apotheosis".to_string()],
            constraints: vec!["Adhere to Ihsan".to_string()],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEvent {
    pub timestamp: String,
    pub source: String,
    pub content: String,
    pub kind: String, // "observation", "thought", "action_receipt"
}

impl MemoryEvent {
    pub fn compute_hash(&self) -> String {
        let payload = format!(
            "{}|{}|{}|{}",
            self.timestamp, self.source, self.kind, self.content
        );
        let mut hasher = Sha256::new();
        hasher.update(payload);
        format!("{:x}", hasher.finalize())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisMemoryConfig {
    pub url: String,
    pub prefix: String,
}

#[cfg(feature = "memory")]
pub struct RedisMemory {
    pub client: redis::Client,
    pub prefix: String,
}

#[cfg(feature = "memory")]
impl RedisMemory {
    pub fn new(config: RedisMemoryConfig) -> Result<Self> {
        let client = redis::Client::open(config.url.as_str())
            .map_err(|e| anyhow!("Invalid Redis URL: {}", e))?;
        Ok(Self {
            client,
            prefix: config.prefix,
        })
    }

    fn format_key(&self, key: &str) -> String {
        format!("{}:{}", self.prefix, key)
    }
}

#[cfg(feature = "memory")]
impl MemoryInterface for RedisMemory {
    fn set(&self, key: &str, value: &str) -> Result<()> {
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Failed to get redis connection: {}", e))?;
        redis::cmd("SET")
            .arg(self.format_key(key))
            .arg(value)
            .query::<()>(&mut con)
            .map_err(|e| anyhow!("Redis SET failed: {}", e))?;
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<String>> {
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Failed to get redis connection: {}", e))?;
        let val: Option<String> = redis::cmd("GET")
            .arg(self.format_key(key))
            .query(&mut con)
            .map_err(|e| anyhow!("Redis GET failed: {}", e))?;
        Ok(val)
    }

    fn get_identity(&self) -> Result<Identity> {
        // Try fetch from Redis, else default
        if let Ok(Some(json)) = self.get("identity") {
            let id: Identity = serde_json::from_str(&json).unwrap_or_default();
            Ok(id)
        } else {
            Ok(Identity::default())
        }
    }

    fn record_event(&self, event: MemoryEvent) -> Result<String> {
        let hash = event.compute_hash();
        let key = format!("event:{}", hash);
        let val = serde_json::to_string(&event)?;
        self.set(&key, &val)?;

        // Also add to timeline list
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Failed to get redis connection: {}", e))?;
        redis::cmd("RPUSH")
            .arg(self.format_key("timeline"))
            .arg(hash.clone())
            .query::<()>(&mut con)?;

        Ok(hash)
    }
}

/// In-memory callback for when Redis is disabled or for testing.
pub struct LocalMemory {
    store: Arc<RwLock<std::collections::HashMap<String, String>>>,
    identity: Arc<RwLock<Identity>>,
}

impl LocalMemory {
    pub fn new() -> Self {
        Self {
            store: Arc::new(RwLock::new(std::collections::HashMap::new())),
            identity: Arc::new(RwLock::new(Identity::default())),
        }
    }
}

impl MemoryInterface for LocalMemory {
    fn set(&self, key: &str, value: &str) -> Result<()> {
        let mut writer = self.store.write().unwrap();
        writer.insert(key.to_string(), value.to_string());
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<String>> {
        let reader = self.read_store();
        Ok(reader.get(key).cloned())
    }

    fn get_identity(&self) -> Result<Identity> {
        let reader = self.identity.read().unwrap();
        Ok(reader.clone())
    }

    fn record_event(&self, event: MemoryEvent) -> Result<String> {
        let hash = event.compute_hash();
        let key = format!("event:{}", hash);
        let val = serde_json::to_string(&event)?;
        self.set(&key, &val)?;
        Ok(hash)
    }
}

impl LocalMemory {
    fn read_store(&self) -> std::sync::RwLockReadGuard<std::collections::HashMap<String, String>> {
        self.store.read().unwrap()
    }
}
