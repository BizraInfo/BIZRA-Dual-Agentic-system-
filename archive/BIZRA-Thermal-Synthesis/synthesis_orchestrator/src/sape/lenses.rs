//! SAPE v1.∞ Lenses
//!
//! Multi-perspective synthesis for high-order abstraction.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LensType {
    SystemsArchitect,
    FormalTheorist,
    PragmaticEngineer,
    Ethicist,
    PoetDesigner,
    Historian,
    Futurist,
}

impl LensType {
    pub fn label(&self) -> &'static str {
        match self {
            Self::SystemsArchitect => "Systems Architect",
            Self::FormalTheorist => "Formal Theorist",
            Self::PragmaticEngineer => "Pragmatic Engineer",
            Self::Ethicist => "Ethicist (Ihsān)",
            Self::PoetDesigner => "Poet/Designer",
            Self::Historian => "Historian",
            Self::Futurist => "Futurist",
        }
    }
}
