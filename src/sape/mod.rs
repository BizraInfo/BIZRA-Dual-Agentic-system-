// src/sape/mod.rs
pub mod base;
pub mod elevator;
pub mod harness;
pub mod tension;
pub mod ihsan;
pub mod graph;
pub mod pattern_compiler;

pub use base::{get_sape, ProbeDimension, ProbeResult, SAPEEngine, SnrTier, TieredProbeResult};
pub use elevator::AbstractionElevator;
pub use harness::SymbolicHarness;
pub use tension::TensionStudio;
pub use graph::{ReasoningGraph, NodeType, EdgeType};
pub use pattern_compiler::{Pattern, PatternCompiler, PatternError, PatternStats, OptimizationLevel};
