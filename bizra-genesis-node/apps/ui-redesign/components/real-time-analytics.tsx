"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"

// Analytics Event Types
interface AnalyticsEvent {
  type: string
  data: any
  timestamp: number
  sessionId: string
  userId?: string
}

interface UserBehavior {
  scrollDepth: number
  timeOnPage: number
  interactions: number
  consciousnessEngagement: number
  quantumFieldInteractions: number
  sacredGeometryClicks: number
  ctaClicks: number
  heatmapData: { x: number; y: number; intensity: number }[]
}

interface PerformanceMetrics {
  pageLoadTime: number
  animationFPS: number
  memoryUsage: number
  networkLatency: number
  errorRate: number
}

// Real-time Analytics Hook
export const useRealTimeAnalytics = () => {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    scrollDepth: 0,
    timeOnPage: 0,
    interactions: 0,
    consciousnessEngagement: 0,
    quantumFieldInteractions: 0,
    sacredGeometryClicks: 0,
    ctaClicks: 0,
    heatmapData: [],
  })
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    animationFPS: 60,
    memoryUsage: 0,
    networkLatency: 0,
    errorRate: 0,
  })

  const startTime = useRef(Date.now())
  const frameCount = useRef(0)
  const lastFrameTime = useRef(Date.now())

  // Track user behavior
  const trackEvent = useCallback(
    (type: string, data: any) => {
      const event: AnalyticsEvent = {
        type,
        data,
        timestamp: Date.now(),
        sessionId,
      }

      // Send to analytics service (simulated)
      console.log("[v0] Analytics Event:", event)

      // Update local metrics
      setUserBehavior((prev) => ({
        ...prev,
        interactions: prev.interactions + 1,
        ...(type === "consciousness_interaction" && { consciousnessEngagement: prev.consciousnessEngagement + 1 }),
        ...(type === "quantum_field_interaction" && { quantumFieldInteractions: prev.quantumFieldInteractions + 1 }),
        ...(type === "sacred_geometry_click" && { sacredGeometryClicks: prev.sacredGeometryClicks + 1 }),
        ...(type === "cta_click" && { ctaClicks: prev.ctaClicks + 1 }),
      }))
    },
    [sessionId],
  )

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      setUserBehavior((prev) => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent),
      }))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000)
      setUserBehavior((prev) => ({ ...prev, timeOnPage }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Track mouse movements for heatmap
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100

      setUserBehavior((prev) => ({
        ...prev,
        heatmapData: [...prev.heatmapData.slice(-50), { x, y, intensity: 1 }],
      }))
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Track performance metrics
  useEffect(() => {
    // Page load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      setPerformanceMetrics((prev) => ({ ...prev, pageLoadTime: loadTime }))
    }

    // FPS monitoring
    const measureFPS = () => {
      frameCount.current++
      const now = Date.now()
      if (now - lastFrameTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current))
        setPerformanceMetrics((prev) => ({ ...prev, animationFPS: fps }))
        frameCount.current = 0
        lastFrameTime.current = now
      }
      requestAnimationFrame(measureFPS)
    }
    measureFPS()

    // Memory usage (if available)
    if ("memory" in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory
        setPerformanceMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        }))
      }
      const memoryInterval = setInterval(updateMemory, 5000)
      return () => clearInterval(memoryInterval)
    }
  }, [])

  return {
    trackEvent,
    userBehavior,
    performanceMetrics,
    sessionId,
  }
}

// Real-time Analytics Dashboard
export const AnalyticsDashboard: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const { userBehavior, performanceMetrics } = useRealTimeAnalytics()

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      <Card className="p-4 bg-background/95 backdrop-blur-sm border-primary/20">
        <h3 className="text-sm font-semibold text-foreground mb-3">Real-time Analytics</h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time on Page:</span>
            <span className="text-accent font-mono">
              {Math.floor(userBehavior.timeOnPage / 60)}m {userBehavior.timeOnPage % 60}s
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Scroll Depth:</span>
            <span className="text-accent font-mono">{userBehavior.scrollDepth}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Interactions:</span>
            <span className="text-accent font-mono">{userBehavior.interactions}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Consciousness Engagement:</span>
            <span className="text-accent font-mono">{userBehavior.consciousnessEngagement}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Sacred Geometry Clicks:</span>
            <span className="text-accent font-mono">{userBehavior.sacredGeometryClicks}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-background/95 backdrop-blur-sm border-primary/20">
        <h3 className="text-sm font-semibold text-foreground mb-3">Performance Metrics</h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">FPS:</span>
            <span
              className={`font-mono ${performanceMetrics.animationFPS >= 50 ? "text-green-400" : performanceMetrics.animationFPS >= 30 ? "text-yellow-400" : "text-red-400"}`}
            >
              {performanceMetrics.animationFPS}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Memory:</span>
            <span className="text-accent font-mono">{performanceMetrics.memoryUsage}MB</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Load Time:</span>
            <span className="text-accent font-mono">{Math.round(performanceMetrics.pageLoadTime / 1000)}s</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Heatmap Visualization
export const HeatmapOverlay: React.FC<{ heatmapData: { x: number; y: number; intensity: number }[] }> = ({
  heatmapData,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {heatmapData.map((point, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 rounded-full bg-accent/20 animate-pulse"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  )
}

// Analytics Provider Component
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackEvent, userBehavior } = useRealTimeAnalytics()
  const [showDashboard, setShowDashboard] = useState(false)

  // Global click tracking
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const elementType = target.tagName.toLowerCase()
      const className = target.className
      const textContent = target.textContent?.slice(0, 50)

      trackEvent("click", {
        elementType,
        className,
        textContent,
        x: e.clientX,
        y: e.clientY,
      })

      // Track specific interactions
      if (className.includes("sacred-geometry") || className.includes("interactive-logo")) {
        trackEvent("sacred_geometry_click", { element: textContent })
      }

      if (className.includes("cta") || elementType === "button") {
        trackEvent("cta_click", { element: textContent })
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [trackEvent])

  // Keyboard shortcut to toggle dashboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setShowDashboard((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <>
      {children}
      <AnalyticsDashboard isVisible={showDashboard} />
      <HeatmapOverlay heatmapData={userBehavior.heatmapData} />
    </>
  )
}

// Export analytics tracking functions
export const analytics = {
  track: (event: string, data?: any) => {
    console.log("[v0] Analytics Track:", { event, data, timestamp: Date.now() })
  },

  trackConsciousnessInteraction: (type: string, intensity: number) => {
    console.log("[v0] Consciousness Interaction:", { type, intensity, timestamp: Date.now() })
  },

  trackQuantumFieldEngagement: (fieldStrength: number, resonance: number) => {
    console.log("[v0] Quantum Field Engagement:", { fieldStrength, resonance, timestamp: Date.now() })
  },

  trackSacredGeometryInteraction: (pattern: string, complexity: number) => {
    console.log("[v0] Sacred Geometry Interaction:", { pattern, complexity, timestamp: Date.now() })
  },
}
