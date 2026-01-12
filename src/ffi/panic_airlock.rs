use pyo3::{exceptions::PyRuntimeError, PyErr, PyResult};
use std::panic::{catch_unwind, AssertUnwindSafe};

pub fn panic_airlock<T>(f: impl FnOnce() -> PyResult<T>) -> PyResult<T> {
    catch_unwind(AssertUnwindSafe(f)).unwrap_or_else(|_| {
        Err(PyErr::new::<PyRuntimeError, _>(
            "panic_airlock: Rust panic safely caught",
        ))
    })
}
