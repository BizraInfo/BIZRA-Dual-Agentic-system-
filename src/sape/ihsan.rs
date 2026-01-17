use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::sync::OnceLock;

const IHSAN_CONSTITUTION_PATH: &str = "constitution/ihsan_v1.yaml";

/// Legacy 3-factor weights (deprecated, use IhsanConstitution)
pub const WEIGHT_BENEVOLENCE: f64 = 0.4;
pub const WEIGHT_TRUTH: f64 = 0.3;
pub const WEIGHT_JUSTICE: f64 = 0.3;

#[derive(Debug, thiserror::Error)]
pub enum IhsanError {
    #[error("Input metrics out of bounds (must be 0.0 - 1.0)")]
    InputOutOfBounds,
    #[error("Constitution load error: {0}")]
    ConstitutionError(String),
    #[error("Weights do not sum to 1.0 (got {0})")]
    WeightSumError(f64),
}

/// Dimension weight from constitution
#[derive(Debug, Clone, Deserialize)]
pub struct DimensionDef {
    pub weight: f64,
    #[allow(dead_code)]
    pub description: String,
}

/// Ihsān Constitution file structure
#[derive(Debug, Clone, Deserialize)]
pub struct IhsanConstitutionFile {
    pub version: u32,
    pub id: String,
    pub status: String,
    pub dimensions: HashMap<String, DimensionDef>,
    #[serde(default)]
    pub threshold_policy: Option<ThresholdPolicy>,
}

#[derive(Debug, Clone, Deserialize, Default)]
pub struct ThresholdPolicy {
    #[serde(default)]
    pub default_env: String,
    #[serde(default)]
    pub thresholds_by_env: HashMap<String, f64>,
}

/// Loaded Ihsān weights from constitution
#[derive(Debug, Clone)]
pub struct IhsanConstitution {
    pub correctness: f64,
    pub safety: f64,
    pub user_benefit: f64,
    pub efficiency: f64,
    pub auditability: f64,
    pub anti_centralization: f64,
    pub robustness: f64,
    pub adl_fairness: f64,
    pub threshold: f64,
    pub constitution_id: String,
}

impl Default for IhsanConstitution {
    /// Fallback weights matching constitution/ihsan_v1.yaml
    fn default() -> Self {
        Self {
            correctness: 0.20,
            safety: 0.20,
            user_benefit: 0.10,
            efficiency: 0.12,
            auditability: 0.12,
            anti_centralization: 0.08,
            robustness: 0.06,
            adl_fairness: 0.12,
            threshold: 0.95,
            constitution_id: "default".to_string(),
        }
    }
}

impl IhsanConstitution {
    /// Load weights from constitution YAML file
    pub fn from_constitution() -> Result<Self, IhsanError> {
        let yaml = fs::read_to_string(IHSAN_CONSTITUTION_PATH)
            .map_err(|e| IhsanError::ConstitutionError(e.to_string()))?;
        Self::from_yaml_str(&yaml)
    }

    /// Parse weights from YAML string
    fn from_yaml_str(yaml: &str) -> Result<Self, IhsanError> {
        let parsed: IhsanConstitutionFile = serde_yaml::from_str(yaml)
            .map_err(|e| IhsanError::ConstitutionError(e.to_string()))?;

        let get_weight = |name: &str| -> f64 {
            parsed.dimensions.get(name).map(|d| d.weight).unwrap_or(0.0)
        };

        let weights = Self {
            correctness: get_weight("correctness"),
            safety: get_weight("safety"),
            user_benefit: get_weight("user_benefit"),
            efficiency: get_weight("efficiency"),
            auditability: get_weight("auditability"),
            anti_centralization: get_weight("anti_centralization"),
            robustness: get_weight("robustness"),
            adl_fairness: get_weight("adl_fairness"),
            threshold: parsed
                .threshold_policy
                .as_ref()
                .and_then(|p| p.thresholds_by_env.get("production").copied())
                .unwrap_or(0.95),
            constitution_id: parsed.id,
        };

        // Validate weights sum to 1.0
        let sum = weights.sum();
        if (sum - 1.0).abs() > 0.01 {
            return Err(IhsanError::WeightSumError(sum));
        }

        Ok(weights)
    }

    /// Sum of all weights (should be 1.0)
    pub fn sum(&self) -> f64 {
        self.correctness
            + self.safety
            + self.user_benefit
            + self.efficiency
            + self.auditability
            + self.anti_centralization
            + self.robustness
            + self.adl_fairness
    }

    /// Get or initialize cached constitution (singleton pattern)
    pub fn get_or_init() -> &'static Self {
        static CONSTITUTION: OnceLock<IhsanConstitution> = OnceLock::new();
        CONSTITUTION.get_or_init(|| {
            Self::from_constitution().unwrap_or_else(|e| {
                tracing::warn!("Failed to load Ihsān constitution: {e}, using defaults");
                Self::default()
            })
        })
    }

    /// Return weights as a map for API responses
    pub fn weights(&self) -> HashMap<String, f64> {
        let mut map = HashMap::new();
        map.insert("correctness".to_string(), self.correctness);
        map.insert("safety".to_string(), self.safety);
        map.insert("user_benefit".to_string(), self.user_benefit);
        map.insert("efficiency".to_string(), self.efficiency);
        map.insert("auditability".to_string(), self.auditability);
        map.insert("anti_centralization".to_string(), self.anti_centralization);
        map.insert("robustness".to_string(), self.robustness);
        map.insert("adl_fairness".to_string(), self.adl_fairness);
        map
    }

    /// Calculate score using constitution weights
    pub fn score(&self, metrics: &IhsanMetrics) -> Result<f64, IhsanError> {
        metrics.validate()?;
        Ok(metrics.correctness * self.correctness
            + metrics.safety * self.safety
            + metrics.user_benefit * self.user_benefit
            + metrics.efficiency * self.efficiency
            + metrics.auditability * self.auditability
            + metrics.anti_centralization * self.anti_centralization
            + metrics.robustness * self.robustness
            + metrics.adl_fairness * self.adl_fairness)
    }

    /// Constitution ID for audit trail
    pub fn id(&self) -> &str {
        &self.constitution_id
    }

    /// Production threshold
    pub fn threshold(&self) -> f64 {
        self.threshold
    }
}

/// Input metrics for Ihsān scoring
#[derive(Debug, Clone, Default)]
pub struct IhsanMetrics {
    pub correctness: f64,
    pub safety: f64,
    pub user_benefit: f64,
    pub efficiency: f64,
    pub auditability: f64,
    pub anti_centralization: f64,
    pub robustness: f64,
    pub adl_fairness: f64,
}

impl IhsanMetrics {
    /// Validate all metrics are in [0.0, 1.0]
    pub fn validate(&self) -> Result<(), IhsanError> {
        let fields = [
            self.correctness,
            self.safety,
            self.user_benefit,
            self.efficiency,
            self.auditability,
            self.anti_centralization,
            self.robustness,
            self.adl_fairness,
        ];
        for f in fields {
            if !(0.0..=1.0).contains(&f) {
                return Err(IhsanError::InputOutOfBounds);
            }
        }
        Ok(())
    }
}

/// Legacy 3-factor score (deprecated)
pub fn calculate_score(b: f64, t: f64, j: f64) -> Result<f64, IhsanError> {
    if !(0.0..=1.0).contains(&b) || !(0.0..=1.0).contains(&t) || !(0.0..=1.0).contains(&j) {
        return Err(IhsanError::InputOutOfBounds);
    }
    Ok((b * WEIGHT_BENEVOLENCE) + (t * WEIGHT_TRUTH) + (j * WEIGHT_JUSTICE))
}

/// Calculate Unified Ihsān Score (8-factor Model)
/// Single Source of Truth: constitution/ihsan_v1.yaml
///
/// NOTE: This function now loads weights from the constitution file.
/// Weights are cached via OnceLock for performance.
#[allow(clippy::too_many_arguments)] // 8 Ihsān dimensions are the API contract
pub fn calculate_unified_score(
    correctness: f64,
    safety: f64,
    benefit: f64,
    efficiency: f64,
    auditability: f64,
    anti_centralization: f64,
    robustness: f64,
    adl_fairness: f64,
) -> Result<f64, IhsanError> {
    let constitution = IhsanConstitution::get_or_init();
    let metrics = IhsanMetrics {
        correctness,
        safety,
        user_benefit: benefit,
        efficiency,
        auditability,
        anti_centralization,
        robustness,
        adl_fairness,
    };
    constitution.score(&metrics)
}

// --- ELITE EXTENSION ---

/// The Golden Ratio (φ) used for architectural balance
pub const PHI: f64 = 1.61803398875;

/// The APEX Threshold for "Masterpiece" quality functionality
pub const MASTERPIECE_THRESHOLD: f64 = 0.95;

/// Evaluates alignment with the "Standing on Shoulders of Giants" protocol.
/// Returns a multiplier (1.0 - 1.5) based on citation of core axioms.
pub fn giant_shoulder_modifier(content: &str) -> f64 {
    let giants = [
        "sovereign",
        "first principles",
        "axiom",
        "logic",
        "proof",
        "truth",
    ];
    let mut multiplier: f64 = 1.0;
    for term in giants {
        if content.to_lowercase().contains(term) {
            multiplier += 0.05;
        }
    }
    multiplier.min(PHI) // Cap at Golden Ratio
}
