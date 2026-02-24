"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePerformance } from "@/hooks/use-performance"
import { useEventBus } from "@/hooks/use-event-bus"
import { useProofEngine } from "@/hooks/use-proof-engine"
import { useIhsan } from "@/hooks/use-ihsan"
import { Activity, Cpu, HardDrive, Zap, Shield, TrendingUp, AlertTriangle } from "lucide-react"

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  unit?: string
  trend?: "up" | "down" | "stable"
  status?: "normal" | "warning" | "critical"
}

function MetricCard({ icon: Icon, label, value, unit, trend, status = "normal" }: MetricCardProps) {
  const statusColors = {
    normal: "text-foreground",
    warning: "text-chart-3",
    critical: "text-destructive",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        {trend && (
          <TrendingUp
            className={`h-3 w-3 ${
              trend === "up" ? "text-accent" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            } ${trend === "down" ? "rotate-180" : ""}`}
          />
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-semibold ${statusColors[status]}`}>{value}</span>
        {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

export function MetricsPanel() {
  const performance = usePerformance()
  const { metrics: eventMetrics } = useEventBus()
  const { metrics: proofMetrics } = useProofEngine()
  const { metrics: ihsanMetrics } = useIhsan()

  const [frameHistory, setFrameHistory] = useState<number[]>([])

  useEffect(() => {
    setFrameHistory((prev) => {
      const next = [...prev, performance.fps]
      return next.slice(-60)
    })
  }, [performance.fps])

  return (
    <div className="space-y-4">
      {/* Performance Grid */}
      <div>
        <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Activity}
            label="Frame Rate"
            value={performance.fps}
            unit="FPS"
            trend={performance.fps >= 120 ? "up" : performance.fps >= 60 ? "stable" : "down"}
            status={performance.fps >= 60 ? "normal" : performance.fps >= 30 ? "warning" : "critical"}
          />
          <MetricCard
            icon={Zap}
            label="Frame Time"
            value={performance.frameTime}
            unit="ms"
            status={performance.frameTime <= 6.94 ? "normal" : performance.frameTime <= 16.67 ? "warning" : "critical"}
          />
          <MetricCard
            icon={Cpu}
            label="CPU Budget"
            value={performance.cpuEstimate}
            unit="%"
            status={performance.cpuEstimate <= 80 ? "normal" : performance.cpuEstimate <= 95 ? "warning" : "critical"}
          />
          <MetricCard
            icon={HardDrive}
            label="Memory"
            value={performance.memory.used || "N/A"}
            unit={performance.memory.used ? "MB" : ""}
          />
        </div>
      </div>

      {/* Frame Rate Sparkline */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            FPS History (60s)
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">Target: 144 FPS</span>
        </div>
        <div className="h-16 flex items-end gap-px">
          {frameHistory.map((fps, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-150"
              style={{
                height: `${Math.min(100, (fps / 144) * 100)}%`,
                backgroundColor:
                  fps >= 120 ? "rgb(52, 211, 153)" : fps >= 60 ? "rgb(56, 189, 248)" : "rgb(239, 68, 68)",
                opacity: 0.3 + (i / frameHistory.length) * 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {/* Event System */}
      <div>
        <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">Event System</h3>
        <div className="bg-card border border-border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Events/sec</span>
            <span className="font-mono text-sm text-foreground">{eventMetrics?.eventsPerSecond ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Avg Latency</span>
            <span className="font-mono text-sm text-foreground">{eventMetrics?.avgLatencyNs ?? 0} ns</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">P99 Latency</span>
            <span className="font-mono text-sm text-foreground">{Math.round(eventMetrics?.p99LatencyNs ?? 0)} ns</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Queue Depth</span>
            <span className="font-mono text-sm text-foreground">{eventMetrics?.queueDepth ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Proof Layer */}
      <div>
        <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">Proof Layer</h3>
        <div className="bg-card border border-border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Total Proofs</span>
            <span className="font-mono text-sm text-foreground">{proofMetrics?.totalProofs ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Verified</span>
            <span className="font-mono text-sm text-accent">{proofMetrics?.verifiedProofs ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Avg Gen Time</span>
            <span className="font-mono text-sm text-foreground">{proofMetrics?.avgGenerationTimeMs ?? 0} ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Pending</span>
            <span className="font-mono text-sm text-foreground">{proofMetrics?.pendingQueue ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Ihsan Compliance */}
      <div>
        <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">Ihsan Compliance</h3>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield
                className={`h-4 w-4 ${(ihsanMetrics?.overallScore ?? 0) >= 0.99 ? "text-accent" : "text-chart-3"}`}
              />
              <span className="font-mono text-xs text-muted-foreground">Overall Score</span>
            </div>
            <span
              className={`font-mono text-lg font-semibold ${
                (ihsanMetrics?.overallScore ?? 0) >= 0.99 ? "text-accent" : "text-chart-3"
              }`}
            >
              {((ihsanMetrics?.overallScore ?? 0) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 rounded-full transition-all duration-500"
                  style={{ width: `${(ihsanMetrics?.accessibility ?? 0) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground w-20">
                A11y: {((ihsanMetrics?.accessibility ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-2 rounded-full transition-all duration-500"
                  style={{ width: `${(ihsanMetrics?.sustainability ?? 0) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground w-20">
                Eco: {((ihsanMetrics?.sustainability ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-3 rounded-full transition-all duration-500"
                  style={{ width: `${(ihsanMetrics?.intentClarity ?? 0) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground w-20">
                Clarity: {((ihsanMetrics?.intentClarity ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {(ihsanMetrics?.violations?.length ?? 0) > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1 mb-2">
                <AlertTriangle className="h-3 w-3 text-chart-3" />
                <span className="font-mono text-[10px] text-chart-3">{ihsanMetrics?.violations.length} violations</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
