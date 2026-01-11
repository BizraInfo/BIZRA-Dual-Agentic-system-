"use client"

import { useEffect, useRef } from "react"

interface MemoryStats {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceMetrics {
  fps: number
  memory: MemoryStats
  timestamp: number
}

class AdvancedMemoryManager {
  private static instance: AdvancedMemoryManager
  private memoryThreshold = 250 * 1024 * 1024 // 250MB threshold
  private criticalThreshold = 400 * 1024 * 1024 // 400MB critical
  private cleanupCallbacks: Set<() => void> = new Set()
  private performanceObserver: PerformanceObserver | null = null
  private memoryCheckInterval: NodeJS.Timeout | null = null
  private lastCleanup = 0
  private isOptimizing = false

  static getInstance(): AdvancedMemoryManager {
    if (!AdvancedMemoryManager.instance) {
      AdvancedMemoryManager.instance = new AdvancedMemoryManager()
    }
    return AdvancedMemoryManager.instance
  }

  initialize() {
    console.log("[v0] Advanced Memory Manager initializing...")

    // Start continuous memory monitoring
    this.startMemoryMonitoring()

    // Initialize performance observer
    this.initializePerformanceObserver()

    // Add visibility change listener for aggressive cleanup
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this))

    // Add beforeunload cleanup
    window.addEventListener("beforeunload", this.emergencyCleanup.bind(this))

    console.log("[v0] Advanced Memory Manager initialized")
  }

  private startMemoryMonitoring() {
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage()
    }, 2000) // Check every 2 seconds
  }

  private initializePerformanceObserver() {
    if ("PerformanceObserver" in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === "measure" && entry.duration > 16.67) {
              console.log(`[v0] Performance warning: ${entry.name} took ${entry.duration}ms`)
            }
          })
        })
        this.performanceObserver.observe({ entryTypes: ["measure", "navigation"] })
      } catch (error) {
        console.warn("[v0] PerformanceObserver not supported:", error)
      }
    }
  }

  private checkMemoryUsage() {
    if (!("memory" in performance)) return

    const memory = (performance as any).memory as MemoryStats
    const currentUsage = memory.usedJSHeapSize

    console.log(
      `[v0] Memory Check: ${Math.round(currentUsage / 1024 / 1024)}MB used, ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB total`,
    )

    if (currentUsage > this.criticalThreshold && !this.isOptimizing) {
      console.warn("[v0] CRITICAL MEMORY USAGE - Initiating emergency cleanup")
      this.emergencyCleanup()
    } else if (currentUsage > this.memoryThreshold && Date.now() - this.lastCleanup > 10000) {
      console.log("[v0] High memory usage detected - Initiating cleanup")
      this.performCleanup()
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      console.log("[v0] Page hidden - Performing aggressive cleanup")
      this.performCleanup(true)
    }
  }

  registerCleanupCallback(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback)
    return () => {
      this.cleanupCallbacks.delete(callback)
    }
  }

  private performCleanup(aggressive = false) {
    if (this.isOptimizing) return

    this.isOptimizing = true
    console.log(`[v0] Performing ${aggressive ? "aggressive" : "standard"} cleanup...`)

    // Execute all registered cleanup callbacks
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("[v0] Cleanup callback error:", error)
      }
    })

    // Force garbage collection if available
    if ("gc" in window && typeof (window as any).gc === "function") {
      ;(window as any).gc()
    }

    // Clear caches and unused resources
    this.clearCaches()

    this.lastCleanup = Date.now()
    this.isOptimizing = false

    console.log("[v0] Cleanup completed")
  }

  private emergencyCleanup() {
    console.error("[v0] EMERGENCY CLEANUP INITIATED")

    // Stop all animations and heavy operations
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("[v0] Emergency cleanup error:", error)
      }
    })

    // Clear all intervals and timeouts
    const highestTimeoutId = setTimeout(() => {}, 0)
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i)
      clearInterval(i)
    }

    // Force multiple garbage collections
    if ("gc" in window && typeof (window as any).gc === "function") {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => (window as any).gc(), i * 100)
      }
    }

    this.clearCaches()
  }

  private clearCaches() {
    // Clear various browser caches
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes("temp") || name.includes("cache")) {
            caches.delete(name)
          }
        })
      })
    }

    // Clear session storage of temporary data
    Object.keys(sessionStorage).forEach((key) => {
      if (key.includes("temp") || key.includes("cache")) {
        sessionStorage.removeItem(key)
      }
    })
  }

  getMemoryStats(): MemoryStats | null {
    if ("memory" in performance) {
      return (performance as any).memory as MemoryStats
    }
    return null
  }

  destroy() {
    console.log("[v0] Destroying Advanced Memory Manager")

    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }

    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
    window.removeEventListener("beforeunload", this.emergencyCleanup)

    this.cleanupCallbacks.clear()
  }
}

export default function AdvancedMemoryManagerComponent() {
  const managerRef = useRef<AdvancedMemoryManager | null>(null)

  useEffect(() => {
    managerRef.current = AdvancedMemoryManager.getInstance()
    managerRef.current.initialize()

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
      }
    }
  }, [])

  return null // This is a service component with no UI
}

export { AdvancedMemoryManager }
