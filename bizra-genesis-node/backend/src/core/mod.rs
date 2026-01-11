//! BIZRA Node0 - Core Infrastructure Components
//!
//! This module provides production-grade infrastructure components:
//!
//! - **Circuit Breaker**: Resilient service communication with adaptive thresholds
//! - **Rate Limiter**: Multiple algorithms (Token Bucket, Sliding Window, Fixed Window)
//! - **Metrics**: High-performance observability with histograms and percentiles
//! - **Scheduler**: Priority-based task scheduling with dependency resolution
//! - **Cache**: Multi-tier caching with LRU eviction and TTL support
//!
//! These components follow industry best practices and are designed for
//! high concurrency, low latency, and operational visibility.

pub mod cache;
pub mod circuit_breaker;
pub mod genesis;
pub mod metrics;
pub mod rate_limiter;
pub mod sape;
pub mod sare;
pub mod scheduler;

// Re-export commonly used types for external access
pub use circuit_breaker::CircuitBreaker;
pub use circuit_breaker::CircuitBreakerConfig;
pub use circuit_breaker::CircuitState;

pub use rate_limiter::Quota;
pub use rate_limiter::QuotaManager;
pub use rate_limiter::SlidingWindowLimiter;
pub use rate_limiter::TokenBucketLimiter;

pub use metrics::Counter;
pub use metrics::Gauge;
pub use metrics::Histogram;
pub use metrics::HistogramBuckets;
pub use metrics::MetricsRegistry;

pub use scheduler::Task;
pub use scheduler::TaskPriority;
pub use scheduler::TaskScheduler;
pub use scheduler::TaskState;

pub use cache::CacheAside;
pub use cache::CacheError;
pub use cache::CacheStats;
pub use cache::LruCache;
pub use cache::MultiTierCache;
