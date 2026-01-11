"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { analytics } from "@/components/real-time-analytics"

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    interactionLatency: 0,
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))

        setMetrics((prev) => ({ ...prev, fps }))

        // Log performance issues
        if (fps < 30) {
          analytics.track("performance_warning", { fps, type: "low_fps" })
        }

        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    // Memory monitoring
    const measureMemory = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        setMetrics((prev) => ({ ...prev, memoryUsage }))

        // Warn about high memory usage
        if (memoryUsage > 100) {
          analytics.track("performance_warning", { memoryUsage, type: "high_memory" })
        }
      }
    }

    measureFPS()
    const memoryInterval = setInterval(measureMemory, 5000)

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(memoryInterval)
    }
  }, [])

  return metrics
}

// Intersection Observer hook for efficient animations
export const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    )

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [hasIntersected, options])

  return { targetRef, isIntersecting, hasIntersected }
}

// Debounced value hook for performance
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttled callback hook
export const useThrottle = <T extends (...args: any[]) => any>(callback: T, delay: number): T => {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay],
  )
}

// Memoized expensive computation hook
export const useExpensiveComputation = <T,>(
  computeFn: () => T,
  dependencies: React.DependencyList,
  cacheKey?: string,
): T => {
  const cache = useRef<Map<string, T>>(new Map())

  return useMemo(() => {
    const key = cacheKey || JSON.stringify(dependencies)

    if (cache.current.has(key)) {
      return cache.current.get(key)!
    }

    const startTime = performance.now()
    const result = computeFn()
    const endTime = performance.now()

    // Log slow computations
    if (endTime - startTime > 16) {
      analytics.track("slow_computation", {
        duration: endTime - startTime,
        cacheKey: key,
      })
    }

    cache.current.set(key, result)

    // Limit cache size
    if (cache.current.size > 50) {
      const firstKey = cache.current.keys().next().value
      cache.current.delete(firstKey)
    }

    return result
  }, dependencies)
}

// Lazy loading component wrapper
export const LazyWrapper: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}> = ({ children, fallback, rootMargin = "100px" }) => {
  const { targetRef, hasIntersected } = useIntersectionObserver({
    rootMargin,
  })

  return <div ref={targetRef}>{hasIntersected ? children : fallback || <div className="h-32" />}</div>
}

// Performance-optimized animation component
export const OptimizedAnimation: React.FC<{
  children: React.ReactNode
  animationClass: string
  threshold?: number
  once?: boolean
}> = ({ children, animationClass, threshold = 0.1, once = true }) => {
  const { targetRef, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold,
  })

  const shouldAnimate = once ? hasIntersected : isIntersecting

  return (
    <div ref={targetRef} className={shouldAnimate ? animationClass : "opacity-0"}>
      {children}
    </div>
  )
}

// Memory cleanup hook
export const useMemoryCleanup = () => {
  const cleanupFunctions = useRef<(() => void)[]>([])

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn)
  }, [])

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach((cleanup) => {
        try {
          cleanup()
        } catch (error) {
          console.error("[v0] Cleanup error:", error)
        }
      })
      cleanupFunctions.current = []
    }
  }, [])

  return addCleanup
}

// Efficient scroll handler
export const useOptimizedScroll = (callback: (scrollY: number) => void, throttleMs = 16) => {
  const ticking = useRef(false)
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset
        if (scrollY !== lastScrollY.current) {
          callback(scrollY)
          lastScrollY.current = scrollY
        }
        ticking.current = false
      })
      ticking.current = true
    }
  }, [callback])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])
}

// Resource preloader
export const useResourcePreloader = () => {
  const preloadedResources = useRef<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        preloadedResources.current.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadFont = useCallback((fontFamily: string, src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve()
    }

    const font = new FontFace(fontFamily, `url(${src})`)
    return font.load().then(() => {
      document.fonts.add(font)
      preloadedResources.current.add(src)
    })
  }, [])

  return { preloadImage, preloadFont }
}

// Performance-aware component renderer
export const PerformanceAwareRenderer: React.FC<{
  children: React.ReactNode
  maxRenderTime?: number
  fallback?: React.ReactNode
}> = ({ children, maxRenderTime = 16, fallback }) => {
  const [shouldRender, setShouldRender] = useState(true)
  const renderStartTime = useRef<number>()

  useEffect(() => {
    renderStartTime.current = performance.now()
  })

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current

      if (renderTime > maxRenderTime) {
        analytics.track("slow_render", {
          renderTime,
          maxRenderTime,
        })

        // Optionally disable heavy rendering on slow devices
        if (renderTime > maxRenderTime * 3) {
          setShouldRender(false)
        }
      }
    }
  })

  if (!shouldRender && fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Batch state updates for performance
export const useBatchedUpdates = <T,>(initialState: T) => {
  const [state, setState] = useState(initialState)
  const pendingUpdates = useRef<Partial<T>[]>([])
  const updateTimeout = useRef<NodeJS.Timeout>()

  const batchUpdate = useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update)

    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current)
    }

    updateTimeout.current = setTimeout(() => {
      setState((prevState) => {
        const newState = { ...prevState }
        pendingUpdates.current.forEach((update) => {
          Object.assign(newState, update)
        })
        pendingUpdates.current = []
        return newState
      })
    }, 16) // Batch updates for one frame
  }, [])

  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current)
      }
    }
  }, [])

  return [state, batchUpdate] as const
}

// Performance context for global optimization settings
export const PerformanceContext = React.createContext({
  isLowPerformance: false,
  prefersReducedMotion: false,
  enableHeavyAnimations: true,
  maxParticles: 100,
})

export const PerformanceProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [settings, setSettings] = useState({
    isLowPerformance: false,
    prefersReducedMotion: false,
    enableHeavyAnimations: true,
    maxParticles: 100,
  })

  useEffect(() => {
    // Detect performance capabilities
    const connection = (navigator as any).connection
    const memory = (navigator as any).deviceMemory

    const isLowPerformance = connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g" || memory < 4

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    setSettings({
      isLowPerformance,
      prefersReducedMotion,
      enableHeavyAnimations: !isLowPerformance && !prefersReducedMotion,
      maxParticles: isLowPerformance ? 20 : 100,
    })

    analytics.track("performance_settings_detected", {
      isLowPerformance,
      prefersReducedMotion,
      connection: connection?.effectiveType,
      memory,
    })
  }, [])

  return <PerformanceContext.Provider value={settings}>{children}</PerformanceContext.Provider>
}

export const usePerformanceSettings = () => {
  return React.useContext(PerformanceContext)
}

// usePerformanceOptimization - combines multiple performance monitoring hooks
export const usePerformanceOptimization = () => {
  const metrics = usePerformanceMonitor()
  const settings = usePerformanceSettings()

  const isOptimized = useMemo(() => {
    return metrics.fps >= 30 && metrics.memoryUsage < 100 && !settings.isLowPerformance
  }, [metrics.fps, metrics.memoryUsage, settings.isLowPerformance])

  const performanceScore = useMemo(() => {
    let score = 100

    // Deduct points for low FPS
    if (metrics.fps < 60) score -= (60 - metrics.fps) * 2
    if (metrics.fps < 30) score -= 20

    // Deduct points for high memory usage
    if (metrics.memoryUsage > 50) score -= metrics.memoryUsage - 50
    if (metrics.memoryUsage > 100) score -= 20

    // Deduct points for slow device
    if (settings.isLowPerformance) score -= 30

    return Math.max(0, Math.min(100, score))
  }, [metrics.fps, metrics.memoryUsage, settings.isLowPerformance])

  return {
    ...metrics,
    ...settings,
    isOptimized,
    performanceScore,
  }
}

// useMemoryManagement - combines memory cleanup and monitoring
export const useMemoryManagement = () => {
  const addCleanup = useMemoryCleanup()
  const { memoryUsage } = usePerformanceMonitor()

  const forceGarbageCollection = useCallback(() => {
    // Force garbage collection if available (Chrome DevTools)
    if ("gc" in window && typeof (window as any).gc === "function") {
      ;(window as any).gc()
    }

    // Clear caches and cleanup
    analytics.track("manual_garbage_collection", { memoryUsage })
  }, [memoryUsage])

  const isMemoryPressure = useMemo(() => {
    return memoryUsage > 100 // More than 100MB
  }, [memoryUsage])

  return {
    addCleanup,
    memoryUsage,
    isMemoryPressure,
    forceGarbageCollection,
  }
}

// LazyLoadComponent - alias for LazyWrapper with better naming
export const LazyLoadComponent: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}> = LazyWrapper
