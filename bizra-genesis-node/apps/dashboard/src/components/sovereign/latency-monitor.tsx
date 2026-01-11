"use client"

import { useEffect, useState, useRef } from "react"
import { useEventBus } from "@/hooks/use-event-bus"
import { Gauge, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface LatencyDataPoint {
  timestamp: number
  avgNs: number
  p99Ns: number
  eventsPerSec: number
}

export function LatencyMonitor() {
  const { metrics } = useEventBus()
  const [history, setHistory] = useState<LatencyDataPoint[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!metrics) return

    setHistory((prev) => {
      const newPoint: LatencyDataPoint = {
        timestamp: Date.now(),
        avgNs: metrics.avgLatencyNs,
        p99Ns: metrics.p99LatencyNs,
        eventsPerSec: metrics.eventsPerSecond,
      }
      const next = [...prev, newPoint]
      return next.slice(-120) // 2 minutes of data
    })
  }, [metrics])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear
    ctx.fillStyle = "rgba(8, 12, 24, 1)"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Grid
    ctx.strokeStyle = "rgba(34, 42, 60, 0.5)"
    ctx.lineWidth = 1

    // Horizontal grid lines with labels
    const maxLatency = 1000 // 1μs target
    const gridLines = [0, 250, 500, 750, 1000]

    for (const value of gridLines) {
      const y = rect.height - (value / maxLatency) * rect.height * 0.9 - 20
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.font = '10px "Geist Mono", monospace'
      ctx.textAlign = "right"
      ctx.fillText(`${value}ns`, 35, y + 3)
    }

    if (history.length < 2) return

    const pointWidth = (rect.width - 50) / 120

    // Draw P99 line (background)
    ctx.beginPath()
    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)"
    ctx.lineWidth = 1
    history.forEach((point, i) => {
      const x = 50 + i * pointWidth
      const y = rect.height - (Math.min(point.p99Ns, maxLatency) / maxLatency) * rect.height * 0.9 - 20
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw average line
    ctx.beginPath()
    ctx.strokeStyle = "rgb(56, 189, 248)"
    ctx.lineWidth = 2
    history.forEach((point, i) => {
      const x = 50 + i * pointWidth
      const y = rect.height - (Math.min(point.avgNs, maxLatency) / maxLatency) * rect.height * 0.9 - 20
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Target line at 250ns
    ctx.beginPath()
    ctx.strokeStyle = "rgb(52, 211, 153)"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    const targetY = rect.height - (250 / maxLatency) * rect.height * 0.9 - 20
    ctx.moveTo(50, targetY)
    ctx.lineTo(rect.width, targetY)
    ctx.stroke()
    ctx.setLineDash([])

    // Target label
    ctx.fillStyle = "rgb(52, 211, 153)"
    ctx.font = '10px "Geist Mono", monospace'
    ctx.textAlign = "left"
    ctx.fillText("TARGET: 250ns", rect.width - 100, targetY - 5)
  }, [history])

  const currentAvg = metrics?.avgLatencyNs ?? 0
  const currentP99 = metrics?.p99LatencyNs ?? 0
  const isWithinTarget = currentAvg <= 250

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Latency Monitor</h2>
        </div>
        <div className="flex items-center gap-2">
          {isWithinTarget ? (
            <CheckCircle className="h-4 w-4 text-accent" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-chart-3" />
          )}
          <span className={`font-mono text-xs ${isWithinTarget ? "text-accent" : "text-chart-3"}`}>
            {isWithinTarget ? "WITHIN TARGET" : "ABOVE TARGET"}
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-border">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Avg Latency</div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-chart-1">{Math.round(currentAvg)}</span>
            <span className="font-mono text-xs text-muted-foreground">ns</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">P99 Latency</div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-destructive/70">{Math.round(currentP99)}</span>
            <span className="font-mono text-xs text-muted-foreground">ns</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Throughput</div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-foreground">{metrics?.eventsPerSecond ?? 0}</span>
            <span className="font-mono text-xs text-muted-foreground">evt/s</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs text-muted-foreground">Optimizing...</span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-2 border-t border-border bg-card/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-chart-1" />
          <span className="font-mono text-[10px] text-muted-foreground">Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-destructive/50" />
          <span className="font-mono text-[10px] text-muted-foreground">P99</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-accent border-dashed" />
          <span className="font-mono text-[10px] text-muted-foreground">Target (250ns)</span>
        </div>
      </div>
    </div>
  )
}
