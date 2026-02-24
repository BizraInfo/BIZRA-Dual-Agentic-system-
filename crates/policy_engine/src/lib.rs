use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ThoughtContext {
    pub author: String,
    pub message: String,
    pub diff_stat: String,
    pub diff_size: i32,
    pub timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub score: f64,
    pub reasoning: Vec<String>,
    pub verdict: String,
}

// ABI: Memory Allocation for Host
#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

// ABI: Deallocation (Safety)
#[no_mangle]
pub unsafe extern "C" fn dealloc(ptr: *mut u8, size: usize) {
    let _ = Vec::from_raw_parts(ptr, 0, size);
}

/// The core SAPE logic engine (WASM Guest)
/// This function receives a serialized ThoughtContext and returns a serialized EvaluationResult.
/// Returns a packed u64: (length << 32) | pointer
#[no_mangle]
pub extern "C" fn evaluate(input_ptr: *const u8, input_len: usize) -> u64 {
    // 1. Safety: Read input from host memory
    let input_slice = unsafe { std::slice::from_raw_parts(input_ptr, input_len) };

    // 2. Deserialization
    let context: ThoughtContext = serde_json::from_slice(input_slice).unwrap_or(ThoughtContext {
        author: "unknown".to_string(),
        message: "error decoding".to_string(),
        diff_stat: "".to_string(),
        diff_size: 0,
        timestamp: 0,
    });

    // 3. SAPE Micro-Evaluation (The "Brain")
    let (score, reasoning) = perform_sape_analysis(&context);

    // 4. Serialization
    let result = EvaluationResult {
        score,
        reasoning,
        verdict: if score >= 0.95 {
            "ACCEPT".to_string()
        } else {
            "REJECT".to_string()
        },
    };

    let mut output_bytes = serde_json::to_vec(&result).unwrap();
    let len = output_bytes.len();
    let ptr = output_bytes.as_mut_ptr();

    std::mem::forget(output_bytes);

    ((len as u64) << 32) | (ptr as u64)
}

fn perform_sape_analysis(context: &ThoughtContext) -> (f64, Vec<String>) {
    let mut score = 1.0;
    let mut reasoning = Vec::new();

    // Check 1: Message Length (Semantics)
    if context.message.len() < 10 {
        score -= 0.1;
        reasoning.push("Message too short (Low Semantic Density)".to_string());
    } else {
        reasoning.push("Message semantics adequate".to_string());
    }

    // Check 2: Diff size (Complexity)
    if context.diff_size > 1000 {
        score -= 0.05;
        reasoning.push("Large diff detected (High Complexity Risk)".to_string());
    }

    // Check 3: Author Reputation (Mock)
    if context.author == "root" {
        reasoning.push("Author 'root' is authorized".to_string());
    }

    (score, reasoning)
}
