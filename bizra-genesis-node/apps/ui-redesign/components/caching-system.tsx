"use client"

import React, { useEffect, useState, useCallback } from "react"

// Cache interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
}

// In-memory cache with TTL and LRU eviction
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set(key: string, data: T, ttl?: number): void {
    // Remove expired entries
    this.cleanup()

    // If at max size, remove least recently used
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.findLRU()
      if (lruKey) {
        this.cache.delete(lruKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access count for LRU
    entry.accessCount++
    entry.timestamp = Date.now()

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    this.cleanup()
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private findLRU(): string | null {
    let lruKey: string | null = null
    let lruTimestamp = Number.POSITIVE_INFINITY

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < lruTimestamp) {
        lruTimestamp = entry.timestamp
        lruKey = key
      }
    }

    return lruKey
  }
}

// Global cache instances
const dataCache = new MemoryCache<any>(200, 10 * 60 * 1000) // 10 minutes
const computationCache = new MemoryCache<any>(50, 30 * 60 * 1000) // 30 minutes
const imageCache = new MemoryCache<string>(100, 60 * 60 * 1000) // 1 hour

// Cached fetch hook
export const useCachedFetch = <T,>(url: string, options?: RequestInit, ttl?: number) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    const cacheKey = `fetch_${url}_${JSON.stringify(options)}`

    // Check cache first
    const cachedData = dataCache.get(cacheKey)
    if (cachedData) {
      setData(cachedData)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Cache the result
      dataCache.set(cacheKey, result, ttl)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setLoading(false)
    }
  }, [url, options, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    const cacheKey = `fetch_${url}_${JSON.stringify(options)}`
    dataCache.delete(cacheKey)
    fetchData()
  }, [url, options, fetchData])

  return { data, loading, error, refetch }
}

// Cached computation hook
export const useCachedComputation = <T,>(
  computeFn: () => T,
  dependencies: React.DependencyList,
  cacheKey: string,
  ttl?: number,
): T => {
  const [result, setResult] = useState<T | null>(null)

  const memoizedResult = React.useMemo(() => {
    const fullCacheKey = `computation_${cacheKey}_${JSON.stringify(dependencies)}`

    // Check cache first
    const cachedResult = computationCache.get(fullCacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // Compute and cache
    const computed = computeFn()
    computationCache.set(fullCacheKey, computed, ttl)

    return computed
  }, dependencies)

  useEffect(() => {
    setResult(memoizedResult)
  }, [memoizedResult])

  return result || memoizedResult
}

// Image preloader with caching
export const useCachedImagePreloader = () => {
  const preloadImage = useCallback(async (src: string): Promise<string> => {
    // Check cache first
    const cachedSrc = imageCache.get(src)
    if (cachedSrc) {
      return cachedSrc
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Cache the successful load
        imageCache.set(src, src)
        resolve(src)
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })
  }, [])

  const preloadImages = useCallback(
    async (sources: string[]): Promise<string[]> => {
      const promises = sources.map((src) => preloadImage(src))
      return Promise.all(promises)
    },
    [preloadImage],
  )

  return { preloadImage, preloadImages }
}

// Local storage cache with expiration
export const useLocalStorageCache = <T,>(
  key: string,
  defaultValue: T,
  ttl: number = 24 * 60 * 60 * 1000, // 24 hours
) => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue
    }

    try {
      const item = localStorage.getItem(key)
      if (!item) {
        return defaultValue
      }

      const parsed = JSON.parse(item)

      // Check if expired
      if (Date.now() - parsed.timestamp > ttl) {
        localStorage.removeItem(key)
        return defaultValue
      }

      return parsed.data
    } catch {
      return defaultValue
    }
  })

  const setCachedValue = useCallback(
    (newValue: T) => {
      setValue(newValue)

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            key,
            JSON.stringify({
              data: newValue,
              timestamp: Date.now(),
            }),
          )
        } catch (error) {
          console.error("[v0] Failed to cache to localStorage:", error)
        }
      }
    },
    [key],
  )

  const clearCache = useCallback(() => {
    setValue(defaultValue)
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  }, [key, defaultValue])

  return [value, setCachedValue, clearCache] as const
}

// Cache statistics hook
export const useCacheStats = () => {
  const [stats, setStats] = useState({
    dataCache: { size: 0, hitRate: 0 },
    computationCache: { size: 0, hitRate: 0 },
    imageCache: { size: 0, hitRate: 0 },
  })

  useEffect(() => {
    const updateStats = () => {
      setStats({
        dataCache: { size: dataCache.size(), hitRate: 0 }, // Hit rate would need tracking
        computationCache: { size: computationCache.size(), hitRate: 0 },
        imageCache: { size: imageCache.size(), hitRate: 0 },
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 5000)

    return () => clearInterval(interval)
  }, [])

  const clearAllCaches = useCallback(() => {
    dataCache.clear()
    computationCache.clear()
    imageCache.clear()
  }, [])

  return { stats, clearAllCaches }
}

// Cache provider component
export const CacheProvider: React.FC<{
  children: React.ReactNode
  maxDataCacheSize?: number
  maxComputationCacheSize?: number
  maxImageCacheSize?: number
}> = ({ children, maxDataCacheSize = 200, maxComputationCacheSize = 50, maxImageCacheSize = 100 }) => {
  useEffect(() => {
    // Initialize cache sizes
    // Note: This is a simplified approach - in a real implementation,
    // you'd want to recreate the cache instances with new sizes
    console.log("[v0] Cache initialized with sizes:", {
      data: maxDataCacheSize,
      computation: maxComputationCacheSize,
      image: maxImageCacheSize,
    })
  }, [maxDataCacheSize, maxComputationCacheSize, maxImageCacheSize])

  return <>{children}</>
}
