"use client"

import { useEffect, useRef, useState } from "react"
import { AdvancedMemoryManager } from "./advanced-memory-manager"

interface PerformanceLevel {
  particles: number
  animationQuality: "low" | "medium" | "high" | "ultra"
  webglEnabled: boolean
  shadowsEnabled: boolean
  postProcessing: boolean
}

const PERFORMANCE_LEVELS: Record<string, PerformanceLevel> = {
  ultra: {
    particles: 1000,
    animationQuality: "ultra",
    webglEnabled: true,
    shadowsEnabled: true,
    postProcessing: true,
  },
  high: {
    particles: 500,
    animationQuality: "high",
    webglEnabled: true,
    shadowsEnabled: true,
    postProcessing: false,
  },
  medium: {
    particles: 200,
    animationQuality: "medium",
    webglEnabled: true,
    shadowsEnabled: false,
    postProcessing: false,
  },
  low: {
    particles: 50,
    animationQuality: "low",
    webglEnabled: false,
    shadowsEnabled: false,
    postProcessing: false,
  },
}

class AdaptivePerformanceEngine {
  private static instance: AdaptivePerformanceEngine
  private currentLevel: PerformanceLevel = PERFORMANCE_LEVELS.high
  private fpsHistory: number[] = []
  private memoryHistory: number[] = []
  private performanceCallbacks: Set<(level: PerformanceLevel) => void> = new Set()
  private monitoringInterval: NodeJS.Timeout | null = null
  private lastFrameTime = 0
  private frameCount = 0
  private memoryManager: AdvancedMemoryManager

  static getInstance(): AdaptivePerformanceEngine {
    if (!AdaptivePerformanceEngine.instance) {
      AdaptivePerformanceEngine.instance = new AdaptivePerformanceEngine()
    }
    return AdaptivePerformanceEngine.instance
  }

  constructor() {
    this.memoryManager = AdvancedMemoryManager.getInstance()
  }

  initialize() {
    console.log("[v0] Adaptive Performance Engine initializing...")

    // Detect device capabilities
    this.detectDeviceCapabilities()

    // Start performance monitoring
    this.startPerformanceMonitoring()

    // Register with memory manager
    this.memoryManager.registerCleanupCallback(() => {
      this.degradePerformance()
    })

    console.log("[v0] Adaptive Performance Engine initialized at level:", this.getCurrentLevelName())
  }

  private detectDeviceCapabilities() {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")

    // Check WebGL support
    const webglSupported = !!gl

    // Check memory
    const memory = this.memoryManager.getMemoryStats()
    const availableMemory = memory ? memory.jsHeapSizeLimit : 0

    // Check CPU cores
    const cores = navigator.hardwareConcurrency || 4

    // Determine initial performance level
    if (!webglSupported || availableMemory < 1024 * 1024 * 1024 || cores < 4) {
      this.currentLevel = PERFORMANCE_LEVELS.low
      console.log("[v0] Low-end device detected, starting at low performance")
    } else if (availableMemory > 4 * 1024 * 1024 * 1024 && cores >= 8) {
      this.currentLevel = PERFORMANCE_LEVELS.ultra
      console.log("[v0] High-end device detected, starting at ultra performance")
    } else {
      this.currentLevel = PERFORMANCE_LEVELS.high
      console.log("[v0] Mid-range device detected, starting at high performance")
    }

    canvas.remove()
  }

  private startPerformanceMonitoring() {
    let lastTime = performance.now()

    const measureFrame = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime
      const fps = 1000 / deltaTime

      this.fpsHistory.push(fps)
      if (this.fpsHistory.length > 60) {
        // Keep last 60 frames
        this.fpsHistory.shift()
      }

      // Check memory every 30 frames
      if (this.frameCount % 30 === 0) {
        const memory = this.memoryManager.getMemoryStats()
        if (memory) {
          const memoryMB = memory.usedJSHeapSize / 1024 / 1024
          this.memoryHistory.push(memoryMB)
          if (this.memoryHistory.length > 20) {
            this.memoryHistory.shift()
          }
        }
      }

      this.frameCount++
      lastTime = currentTime

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)

    // Analyze performance every 3 seconds
    this.monitoringInterval = setInterval(() => {
      this.analyzePerformance()
    }, 3000)
  }

  private analyzePerformance() {
    if (this.fpsHistory.length < 30) return

    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
    const avgMemory =
      this.memoryHistory.length > 0 ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length : 0

    console.log(`[v0] Performance Analysis: ${avgFps.toFixed(1)} FPS, ${avgMemory.toFixed(1)}MB memory`)

    const currentLevelName = this.getCurrentLevelName()

    // Performance degradation conditions
    if (avgFps < 30 || avgMemory > 350) {
      if (currentLevelName !== "low") {
        console.log("[v0] Performance degradation detected, reducing quality")
        this.degradePerformance()
      }
    }
    // Performance improvement conditions
    else if (avgFps > 55 && avgMemory < 200) {
      if (currentLevelName !== "ultra") {
        console.log("[v0] Good performance detected, increasing quality")
        this.improvePerformance()
      }
    }
  }

  private degradePerformance() {
    const currentName = this.getCurrentLevelName()
    let newLevel: PerformanceLevel

    switch (currentName) {
      case "ultra":
        newLevel = PERFORMANCE_LEVELS.high
        break
      case "high":
        newLevel = PERFORMANCE_LEVELS.medium
        break
      case "medium":
        newLevel = PERFORMANCE_LEVELS.low
        break
      default:
        return // Already at lowest level
    }

    this.setPerformanceLevel(newLevel)
    console.log(`[v0] Performance degraded to: ${this.getCurrentLevelName()}`)
  }

  private improvePerformance() {
    const currentName = this.getCurrentLevelName()
    let newLevel: PerformanceLevel

    switch (currentName) {
      case "low":
        newLevel = PERFORMANCE_LEVELS.medium
        break
      case "medium":
        newLevel = PERFORMANCE_LEVELS.high
        break
      case "high":
        newLevel = PERFORMANCE_LEVELS.ultra
        break
      default:
        return // Already at highest level
    }

    this.setPerformanceLevel(newLevel)
    console.log(`[v0] Performance improved to: ${this.getCurrentLevelName()}`)
  }

  private setPerformanceLevel(level: PerformanceLevel) {
    this.currentLevel = level

    // Notify all registered callbacks
    this.performanceCallbacks.forEach((callback) => {
      try {
        callback(level)
      } catch (error) {
        console.error("[v0] Performance callback error:", error)
      }
    })
  }

  private getCurrentLevelName(): string {
    return Object.keys(PERFORMANCE_LEVELS).find((key) => PERFORMANCE_LEVELS[key] === this.currentLevel) || "unknown"
  }

  registerPerformanceCallback(callback: (level: PerformanceLevel) => void): () => void {
    this.performanceCallbacks.add(callback)

    // Immediately call with current level
    callback(this.currentLevel)

    return () => {
      this.performanceCallbacks.delete(callback)
    }
  }

  getCurrentLevel(): PerformanceLevel {
    return { ...this.currentLevel }
  }

  forceLevel(levelName: keyof typeof PERFORMANCE_LEVELS) {
    if (PERFORMANCE_LEVELS[levelName]) {
      this.setPerformanceLevel(PERFORMANCE_LEVELS[levelName])
      console.log(`[v0] Performance level forced to: ${levelName}`)
    }
  }

  getPerformanceStats() {
    const avgFps = this.fpsHistory.length > 0 ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : 0
    const avgMemory =
      this.memoryHistory.length > 0 ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length : 0

    return {
      fps: avgFps,
      memory: avgMemory,
      level: this.getCurrentLevelName(),
      particles: this.currentLevel.particles,
      quality: this.currentLevel.animationQuality,
    }
  }

  destroy() {
    console.log("[v0] Destroying Adaptive Performance Engine")

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.performanceCallbacks.clear()
    this.fpsHistory = []
    this.memoryHistory = []
  }
}

export default function AdaptivePerformanceEngineComponent() {
  const engineRef = useRef<AdaptivePerformanceEngine | null>(null)
  const [performanceStats, setPerformanceStats] = useState<any>(null)

  useEffect(() => {
    engineRef.current = AdaptivePerformanceEngine.getInstance()
    engineRef.current.initialize()

    // Update stats every 5 seconds
    const statsInterval = setInterval(() => {
      if (engineRef.current) {
        setPerformanceStats(engineRef.current.getPerformanceStats())
      }
    }, 5000)

    return () => {
      clearInterval(statsInterval)
      if (engineRef.current) {
        engineRef.current.destroy()
      }
    }
  }, [])

  return null // Service component with no UI
}

export { AdaptivePerformanceEngine }
