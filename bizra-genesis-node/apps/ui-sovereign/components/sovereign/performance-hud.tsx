"use client"

import { useEffect, useRef, useState } from "react"
import { usePerformance } from "@/hooks/use-performance"
import { Activity, MemoryStick as Memory, Zap, Thermometer, Clock } from "lucide-react"

interface GaugeProps {
  value: number
  max: number
  label: string
  unit: string
  color: string
  threshold: number
}

function CircularGauge({ value, max, label, unit, color, threshold }: GaugeProps) {
  const percentage = Math.min(100, (value / max) * 100)
  const isWarning = value > threshold

  const circumference = 2 * Math.PI * 40
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(34, 42, 60, 0.8)" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={isWarning ? "rgb(239, 68, 68)" : color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-xl font-bold ${isWarning ? "text-destructive" : "text-foreground"}`}>
            {Math.round(value)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function PerformanceHUD() {
  const performance = usePerformance()
  const [gpuTemp, setGpuTemp] = useState(45)
  const [uptime, setUptime] = useState(0)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate GPU temperature fluctuation
      setGpuTemp((prev) => Math.max(40, Math.min(85, prev + (Math.random() - 0.5) * 2)))
      setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Performance HUD</h2>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">{formatUptime(uptime)}</span>
        </div>
      </div>

      {/* Gauges */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-6">
          <CircularGauge
            value={performance.fps}
            max={144}
            label="Frame Rate"
            unit="FPS"
            color="rgb(56, 189, 248)"
            threshold={120}
          />
          <CircularGauge
            value={performance.frameTime}
            max={16.67}
            label="Frame Time"
            unit="ms"
            color="rgb(52, 211, 153)"
            threshold={10}
          />
          <CircularGauge
            value={performance.cpuEstimate}
            max={100}
            label="CPU Load"
            unit="%"
            color="rgb(251, 191, 36)"
            threshold={80}
          />
          <CircularGauge value={gpuTemp} max={100} label="GPU Temp" unit="°C" color="rgb(239, 68, 68)" threshold={70} />
        </div>

        {/* Memory Bar */}
        <div className="mt-6 p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Memory className="h-4 w-4 text-chart-4" />
              <span className="font-mono text-xs text-muted-foreground">Memory Usage</span>
            </div>
            <span className="font-mono text-xs text-foreground">
              {performance.memory.used || "N/A"} / {performance.memory.total || "N/A"} MB
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-chart-4 to-chart-5 rounded-full transition-all duration-300"
              style={{ width: `${performance.memory.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3 w-3 text-chart-3" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">Jank Events</span>
            </div>
            <span className="font-mono text-lg font-semibold text-foreground">{performance.jankCount}</span>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="h-3 w-3 text-destructive" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">Thermal</span>
            </div>
            <span
              className={`font-mono text-lg font-semibold ${gpuTemp > 70 ? "text-destructive" : gpuTemp > 60 ? "text-chart-3" : "text-accent"}`}
            >
              {gpuTemp > 70 ? "HOT" : gpuTemp > 60 ? "WARM" : "COOL"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-card/50">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>Target: 144 FPS @ 6.94ms</span>
          <span>WebGL 2.0 | WASM Enabled</span>
        </div>
      </div>
    </div>
  )
}
