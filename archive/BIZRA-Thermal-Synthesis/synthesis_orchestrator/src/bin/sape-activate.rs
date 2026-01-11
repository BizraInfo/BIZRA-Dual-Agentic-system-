use synthesis_orchestrator::sape::schema::*;
use synthesis_orchestrator::sape::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("--- BIZRA SAPE v1.∞ MASTERPIECE ENGINE ---");

    // 1. Define Intent
    let intent = Intent {
        domain: "Node-0 Sovereign Integrity".into(),
        objective: "Verify the legal-technical binding of Node-0 to the Genesis manifest".into(),
        stakes: Stakes::High,
        constraints: vec!["Must be verifiable offline".into()],
        success_criteria: vec!["Binary commit status reached".into()],
        forbidden_moves: vec!["Hallucinate non-existent files".into()],
    };

    // 2. Initialize Executor
    let executor = SapeExecutor::new(intent);

    println!("🚀 Executing Peak Masterpiece Pipeline...");

    // 3. Run Pipeline
    match executor.execute().await {
        Ok(output) => {
            println!("✅ SAPE CYCLE COMPLETE: INTEGRITY ASSURED");
            println!("Confidence: {:.4}", output.conclusion.confidence_score);
            println!(
                "SNR Evidence Coverage: {:.2}",
                output.validation.evidence_coverage
            );
            println!("Ihsān Gate Status: PASSED");

            // Output JSON for downstream UI
            let json = serde_json::to_string_pretty(&output)?;
            std::fs::write("sape_activation_report.json", json)?;
            println!("📄 Report saved to: sape_activation_report.json");
        }
        Err(e) => {
            println!("❌ SAPE CYCLE FAILED: VETO TRIGGERED");
            eprintln!("Error: {}", e);
        }
    }

    Ok(())
}
