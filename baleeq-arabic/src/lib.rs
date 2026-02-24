pub mod lexer;

pub use lexer::arabic_tokenizer;

use pyo3::prelude::*;

#[pymodule]
fn baleeq_arabic(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(arabic_tokenizer::tokenize, m)?)?;
    m.add_class::<arabic_tokenizer::Token>()?;
    Ok(())
}
