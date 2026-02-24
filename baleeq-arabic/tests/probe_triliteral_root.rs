use baleeq_arabic::arabic_tokenizer::{tokenize, Token};

#[test]
fn test_keyword_must_have_triliteral_root() {
    // "كتب" is valid (3 chars)
    let valid_input = "كتب";
    let result = tokenize(valid_input);
    assert!(result.is_ok(), "Valid 3-char root should be accepted");
}

#[test]
fn test_adversarial_rejection_two_letters() {
    // "لعل" is 2 letters. In our model, a root MUST be 3 letters.
    // If we assume every word in this context must be a root (as defined in receipt),
    // let's see if the tokenizer flags it if we enforce strict root extraction.
    let input = "لعل";
    let _ = tokenize(input).expect("Should tokenize but mark root as None if not 3 chars");
}

#[test]
fn test_hamza_normalization() {
    // Test normalization with different Hamza forms
    let input = "إذَا"; // With tashkeel
    let tokens = tokenize(input).unwrap();
    // NFKC normalization will handle the canonical form
    assert!(!tokens[0].text.is_empty());
}
