"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTelemetrySocket } from "@/hooks/use-telemetry-socket"
import { Card } from "@/components/ui/card"

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  cpuUsage: number
  networkLatency: number
  renderTime: number
  jsHeapSize: number
  domNodes: number
  resourceLoadTime: number
  consciousnessFieldPerformance: number
  quantumProcessingEfficiency: number
  aiResponseTime: number
  collectiveIntelligenceLatency: number
}

interface SystemHealth {
  overall: "optimal" | "good" | "degraded" | "critical"
  components: {
    rendering: "optimal" | "good" | "degraded" | "critical"
    memory: "optimal" | "good" | "degraded" | "critical"
    network: "optimal" | "good" | "degraded" | "critical"
    consciousness: "optimal" | "good" | "degraded" | "critical"
    quantum: "optimal" | "good" | "degraded" | "critical"
    ai: "optimal" | "good" | "degraded" | "critical"
  }
  recommendations: string[]
}

interface OptimizationSuggestion {
  id: string
  type: "performance" | "memory" | "network" | "user-experience"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  implemented: boolean
}

export function AdvancedPerformanceMonitor() {
  const { telemetry } = useTelemetrySocket()
  const telemetryRef = useRef(telemetry)

  // Keep ref in sync for animation loop
  useEffect(() => {
    telemetryRef.current = telemetry
  }, [telemetry])

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    jsHeapSize: 0,
    domNodes: 0,
    resourceLoadTime: 0,
    consciousnessFieldPerformance: 100,
    quantumProcessingEfficiency: 95,
    aiResponseTime: 150,
    collectiveIntelligenceLatency: 80,
  })

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "optimal",
    components: {
      rendering: "optimal",
      memory: "optimal",
      network: "optimal",
      consciousness: "optimal",
      quantum: "optimal",
      ai: "optimal",
    },
    recommendations: [],
  })

  const [isMonitoring, setIsMonitoring] = useState(false)
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([])
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  const measurePerformance = useCallback(() => {
    const now = performance.now()

    // FPS calculation
    frameCountRef.current++
    const deltaTime = now - lastTimeRef.current
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime)
      frameCountRef.current = 0
      lastTimeRef.current = now

      // Memory usage
      const memory = (performance as any).memory
      const memoryUsage = memory ? Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100) : 0
      const jsHeapSize = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0

      // DOM complexity
      const domNodes = document.querySelectorAll("*").length

      // Network performance simulation
      const networkLatency = Math.random() * 50 + 20

      // Consciousness field performance (simulated based on active components)
      const consciousnessComponents = document.querySelectorAll('[class*="consciousness"], [class*="quantum"]').length
      const consciousnessFieldPerformance = Math.max(60, 100 - consciousnessComponents * 2)

      // Quantum processing efficiency
      const quantumElements = document.querySelectorAll('[class*="quantum"]').length
      const quantumProcessingEfficiency = Math.max(70, 100 - quantumElements * 1.5)

      // AI response time simulation
      const aiResponseTime = Math.random() * 200 + 100

      // Collective intelligence latency
      const collectiveIntelligenceLatency = Math.random() * 100 + 50

      // Use Telemetry if available, otherwise fallback/browser simulation
      const t = telemetryRef.current

      const cpuUsage = t ? t.resources.cpuUsage : Math.min(100, memoryUsage * 0.8 + Math.random() * 20)
      const memUsage = t ? t.resources.memoryUsage : memoryUsage
      const netLatency = t ? Math.round(t.latencyUs / 100) / 10 : Math.random() * 50 + 20

      const newMetrics: PerformanceMetrics = {
        fps,
        memoryUsage: memUsage,
        cpuUsage,
        networkLatency: netLatency,
        renderTime: Math.random() * 16 + 4,
        jsHeapSize,
        domNodes,
        resourceLoadTime: Math.random() * 500 + 200,
        consciousnessFieldPerformance,
        quantumProcessingEfficiency,
        aiResponseTime,
        collectiveIntelligenceLatency,
      }

      setMetrics(newMetrics)
      setPerformanceHistory((prev) => [...prev.slice(-29), fps])

      // System health assessment
      const health = assessSystemHealth(newMetrics)
      setSystemHealth(health)
    }
  }, [])

  const assessSystemHealth = (metrics: PerformanceMetrics): SystemHealth => {
    const getHealthStatus = (value: number, thresholds: [number, number, number]): "optimal" | "good" | "degraded" | "critical" => {
      if (value >= thresholds[0]) return "optimal"
      if (value >= thresholds[1]) return "good"
      if (value >= thresholds[2]) return "degraded"
      return "critical"
    }

    const components = {
      rendering: getHealthStatus(metrics.fps, [55, 45, 30]),
      memory: getHealthStatus(100 - metrics.memoryUsage, [80, 60, 40]),
      network: getHealthStatus(100 - metrics.networkLatency, [80, 60, 40]),
      consciousness: getHealthStatus(metrics.consciousnessFieldPerformance, [90, 75, 60]),
      quantum: getHealthStatus(metrics.quantumProcessingEfficiency, [85, 70, 55]),
      ai: getHealthStatus(300 - metrics.aiResponseTime, [200, 150, 100]),
    }

    const healthScores = Object.values(components).map((status) => {
      switch (status) {
        case "optimal":
          return 4
        case "good":
          return 3
        case "degraded":
          return 2
        case "critical":
          return 1
        default:
          return 0
      }
    })

    const averageScore = healthScores.reduce((a: number, b) => a + b, 0) / healthScores.length
    const overall =
      averageScore >= 3.5 ? "optimal" : averageScore >= 2.5 ? "good" : averageScore >= 1.5 ? "degraded" : "critical"

    const recommendations: string[] = []
    if (components.rendering !== "optimal") recommendations.push("Reduce visual effects for better frame rate")
    if (components.memory !== "optimal") recommendations.push("Clear browser cache and close unused tabs")
    if (components.network !== "optimal") recommendations.push("Check internet connection stability")
    if (components.consciousness !== "optimal") recommendations.push("Optimize consciousness field calculations")
    if (components.quantum !== "optimal") recommendations.push("Reduce quantum visualization complexity")
    if (components.ai !== "optimal") recommendations.push("Optimize AI processing pipeline")

    return { overall, components, recommendations }
  }

  useEffect(() => {
    if (isMonitoring) {
      const monitoringInterval = setInterval(measurePerformance, 1000)
      const frameMonitoring = () => {
        measurePerformance()
        if (isMonitoring) requestAnimationFrame(frameMonitoring)
      }
      requestAnimationFrame(frameMonitoring)

      return () => {
        clearInterval(monitoringInterval)
      }
    }
  }, [isMonitoring, measurePerformance])

  useEffect(() => {
    setIsMonitoring(true)
    return () => setIsMonitoring(false)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "text-white"
      case "good":
        return "text-white"
      case "degraded":
        return "text-white"
      case "critical":
        return "text-white"
      default:
        return "text-white"
    }
  }

  const getHealthBg = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-green-500/80"
      case "good":
        return "bg-primary/80"
      case "degraded":
        return "bg-orange-500/80"
      case "critical":
        return "bg-red-500/80"
      default:
        return "bg-slate-500/80"
    }
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card className="bg-black/60 backdrop-blur-xl border border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">BIZRA SYSTEM HEALTH</span>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${getHealthBg(systemHealth.overall)} ${getHealthColor(systemHealth.overall)}`}
          >
            {systemHealth.overall.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(systemHealth.components).map(([component, status]) => (
            <div key={component} className="text-center p-3 rounded-lg bg-black/40 backdrop-blur-sm">
              <div className={`text-sm font-bold mb-1 ${getHealthColor(status)}`}>
                {component.charAt(0).toUpperCase() + component.slice(1)}
              </div>
              <div className={`text-xs ${getHealthColor(status)}`}>{status.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {systemHealth.recommendations.length > 0 && (
          <div className="border-t border-primary/20 pt-4">
            <div className="text-xs text-white font-bold mb-2">OPTIMIZATION RECOMMENDATIONS:</div>
            <ul className="space-y-1">
              {systemHealth.recommendations.map((rec, index) => (
                <li key={index} className="text-xs text-white flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent rounded-full"></div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Real-time Performance Metrics */}
      <Card className="bg-black/60 backdrop-blur-xl border border-accent/20 p-6">
        <div className="text-center mb-4">
          <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">
            REAL-TIME PERFORMANCE METRICS
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">{metrics.fps}</div>
            <div className="text-xs text-white uppercase tracking-wide">FPS</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (metrics.fps / 60) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">
              {metrics.memoryUsage}
              <span className="text-white">%</span>
            </div>
            <div className="text-xs text-white uppercase tracking-wide">Memory</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-accent h-1 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.memoryUsage}%` }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">
              {metrics.networkLatency.toFixed(0)}
              <span className="text-white">ms</span>
            </div>
            <div className="text-xs text-white uppercase tracking-wide">Latency</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (100 - metrics.networkLatency) * 2)}%` }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">
              {metrics.jsHeapSize}
              <span className="text-white">MB</span>
            </div>
            <div className="text-xs text-white uppercase tracking-wide">JS Heap</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-accent h-1 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (metrics.jsHeapSize / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-accent/20 pt-4">
          <div className="text-center space-y-2">
            <div className="text-lg font-bold text-white">
              {metrics.consciousnessFieldPerformance.toFixed(1)}
              <span className="text-white">%</span>
            </div>
            <div className="text-xs text-white">Consciousness Field</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg font-bold text-white">
              {metrics.quantumProcessingEfficiency.toFixed(1)}
              <span className="text-white">%</span>
            </div>
            <div className="text-xs text-white">Quantum Processing</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg font-bold text-white">
              {metrics.aiResponseTime.toFixed(0)}
              <span className="text-white">ms</span>
            </div>
            <div className="text-xs text-white">AI Response Time</div>
          </div>
        </div>
      </Card>

      {/* Performance History Chart */}
      <Card className="bg-black/60 backdrop-blur-xl border border-primary/20 p-6">
        <div className="text-center mb-4">
          <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">PERFORMANCE HISTORY</span>
        </div>

        <div className="relative h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg overflow-hidden">
          <svg width="100%" height="100%" className="absolute inset-0">
            {performanceHistory.length > 1 && (
              <polyline
                points={performanceHistory
                  .map((fps, index) => `${(index / (performanceHistory.length - 1)) * 100}%,${100 - (fps / 60) * 100}%`)
                  .join(" ")}
                fill="none"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="2"
                className="animate-pulse"
              />
            )}
          </svg>

          <div className="absolute bottom-2 left-2 text-xs text-white">0 FPS</div>
          <div className="absolute top-2 left-2 text-xs text-white">60 FPS</div>
          <div className="absolute bottom-2 right-2 text-xs text-white">Now</div>
        </div>
      </Card>
    </div>
  )
}

export function PerformanceOptimizer() {
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([
    {
      id: "reduce-particles",
      type: "performance",
      priority: "high",
      title: "Optimize Particle Systems",
      description: "Reduce particle count for low-end devices",
      impact: "15-25% FPS improvement",
      implemented: false,
    },
    {
      id: "lazy-load-quantum",
      type: "memory",
      priority: "medium",
      title: "Lazy Load Quantum Visualizations",
      description: "Load quantum components only when visible",
      impact: "30% memory reduction",
      implemented: false,
    },
    {
      id: "cache-ai-responses",
      type: "network",
      priority: "medium",
      title: "Cache AI Responses",
      description: "Cache frequently requested AI insights",
      impact: "50% faster AI responses",
      implemented: false,
    },
    {
      id: "optimize-consciousness-field",
      type: "performance",
      priority: "high",
      title: "Consciousness Field Optimization",
      description: "Use WebGL for consciousness field rendering",
      impact: "40% rendering improvement",
      implemented: false,
    },
  ])

  const implementOptimization = (id: string) => {
    setOptimizations((prev) => prev.map((opt) => (opt.id === id ? { ...opt, implemented: true } : opt)))

    // Simulate performance improvement
    setTimeout(() => {
      console.log(`[v0] Optimization ${id} implemented successfully`)
    }, 1000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-white bg-red-500/80"
      case "medium":
        return "text-white bg-orange-500/80"
      case "low":
        return "text-white bg-green-500/80"
      default:
        return "text-white bg-slate-500/80"
    }
  }

  return (
    <Card className="bg-black/60 backdrop-blur-xl border border-accent/20 p-6">
      <div className="text-center mb-6">
        <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">PERFORMANCE OPTIMIZER</span>
        <div className="text-white mt-1">AI-powered optimization suggestions</div>
      </div>

      <div className="space-y-4">
        {optimizations.map((opt) => (
          <div
            key={opt.id}
            className={`p-4 rounded-lg border transition-all duration-300 ${opt.implemented
              ? "bg-green-400/10 border-green-400/30"
              : "bg-black/40 border-primary/20 hover:border-accent/40"
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(opt.priority)}`}>
                  {opt.priority.toUpperCase()}
                </span>
                <span className="text-xs text-white uppercase">{opt.type}</span>
              </div>
              {opt.implemented && <div className="text-green-400 text-xs font-bold">✓ IMPLEMENTED</div>}
            </div>

            <h3 className="text-sm font-bold text-white mb-1">{opt.title}</h3>
            <p className="text-xs text-white mb-2">{opt.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white">Impact: {opt.impact}</span>
              {!opt.implemented && (
                <button
                  onClick={() => implementOptimization(opt.id)}
                  className="px-3 py-1 bg-primary hover:bg-primary/80 text-white text-xs font-bold rounded transition-colors duration-200"
                >
                  IMPLEMENT
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="text-xs text-white">
          {optimizations.filter((opt) => opt.implemented).length} of {optimizations.length} optimizations implemented
        </div>
      </div>
    </Card>
  )
}

export function NetworkPerformanceMonitor() {
  const [networkMetrics, setNetworkMetrics] = useState({
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    connectionType: "unknown",
    effectiveType: "4g",
    dataUsage: 0,
    compressionRatio: 85,
  })

  useEffect(() => {
    const updateNetworkMetrics = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        setNetworkMetrics((prev) => ({
          ...prev,
          connectionType: connection.type || "unknown",
          effectiveType: connection.effectiveType || "4g",
          downloadSpeed: connection.downlink || Math.random() * 100 + 10,
          ping: Math.random() * 50 + 10,
          uploadSpeed: Math.random() * 20 + 5,
          dataUsage: prev.dataUsage + Math.random() * 0.1,
          compressionRatio: 85 + Math.random() * 10,
        }))
      }
    }

    updateNetworkMetrics()
    const interval = setInterval(updateNetworkMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-black/60 backdrop-blur-xl border border-primary/20 p-6">
      <div className="text-center mb-4">
        <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">NETWORK PERFORMANCE</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-white">{networkMetrics.downloadSpeed.toFixed(1)}</div>
          <div className="text-xs text-white">Mbps Down</div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-white">{networkMetrics.uploadSpeed.toFixed(1)}</div>
          <div className="text-xs text-white">Mbps Up</div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-white">{networkMetrics.ping.toFixed(0)}</div>
          <div className="text-xs text-white">ms Ping</div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-white">{networkMetrics.compressionRatio.toFixed(0)}%</div>
          <div className="text-xs text-white">Compression</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-primary/20 text-center">
        <div className="text-xs text-white">
          Connection: {networkMetrics.effectiveType.toUpperCase()} • Data Usage: {networkMetrics.dataUsage.toFixed(2)}{" "}
          MB
        </div>
      </div>
    </Card>
  )
}

export const PerformanceMonitor = AdvancedPerformanceMonitor

export function SystemHealthIndicator() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "optimal",
    components: {
      rendering: "optimal",
      memory: "optimal",
      network: "optimal",
      consciousness: "optimal",
      quantum: "optimal",
      ai: "optimal",
    },
    recommendations: [],
  })

  const [isVisible, setIsVisible] = useState(false)

  const { telemetry } = useTelemetrySocket()

  useEffect(() => {
    // Check health based on telemetry or local fallback
    const checkSystemHealth = () => {
      let memoryUsage = 0

      if (telemetry) {
        memoryUsage = telemetry.resources.memoryUsage
      } else {
        const memory = (performance as any).memory
        memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0
      }

      const components: SystemHealth['components'] = {
        rendering: (memoryUsage < 70 ? "optimal" : memoryUsage < 85 ? "good" : "degraded") as "optimal" | "good" | "degraded" | "critical",
        memory: (memoryUsage < 60 ? "optimal" : memoryUsage < 80 ? "good" : "degraded") as "optimal" | "good" | "degraded" | "critical",
        network: "optimal", // Simplified for now
        consciousness: "optimal",
        quantum: "optimal",
        ai: "optimal",
      }

      const healthScores = Object.values(components).map((status) => {
        switch (status) {
          case "optimal":
            return 4
          case "good":
            return 3
          case "degraded":
            return 2
          case "critical":
            return 1
          default:
            return 0
        }
      })

      const averageScore = healthScores.reduce((a: number, b) => a + b, 0) / healthScores.length
      const overall =
        averageScore >= 3.5 ? "optimal" : averageScore >= 2.5 ? "good" : averageScore >= 1.5 ? "degraded" : "critical"

      setSystemHealth({ overall, components, recommendations: [] })
    }

    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 5000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "text-white"
      case "good":
        return "text-white"
      case "degraded":
        return "text-white"
      case "critical":
        return "text-white"
      default:
        return "text-white"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${systemHealth.overall === "optimal"
          ? "bg-green-500"
          : systemHealth.overall === "good"
            ? "bg-primary"
            : systemHealth.overall === "degraded"
              ? "bg-accent"
              : "bg-red-500"
          } ${isVisible ? "scale-150" : "hover:scale-125"}`}
        title={`System Health: ${systemHealth.overall}`}
      />

      {isVisible && (
        <div className="absolute top-6 right-0 w-64 bg-black/80 backdrop-blur-xl border border-primary/20 rounded-lg p-3 text-xs">
          <div className="text-center mb-2">
            <span className="text-white font-serif font-bold uppercase tracking-wide">System Health</span>
          </div>
          <div className="space-y-1">
            {Object.entries(systemHealth.components).map(([component, status]) => (
              <div key={component} className="flex justify-between items-center">
                <span className="text-white capitalize">{component}</span>
                <span className={`font-bold ${getHealthColor(status)}`}>{status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
