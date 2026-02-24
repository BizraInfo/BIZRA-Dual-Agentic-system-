"use client"

import { useEffect, useState } from "react"
import { useIhsan } from "@/hooks/use-ihsan"
import { Shield, Eye, Leaf, Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"

export function IhsanDashboard() {
  const { metrics, constraints } = useIhsan()
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    if (metrics) {
      setHistory((prev) => {
        const next = [...prev, metrics.overallScore]
        return next.slice(-60)
      })
    }
  }, [metrics])

  const score = metrics?.overallScore ?? 0
  const isCompliant = score >= 0.99

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Ihsan Compliance Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          {isCompliant ? (
            <CheckCircle className="h-4 w-4 text-accent" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-chart-3" />
          )}
          <span className={`font-mono text-xs ${isCompliant ? "text-accent" : "text-chart-3"}`}>
            {isCompliant ? "COMPLIANT" : "WARNING"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Score */}
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <svg className="w-40 h-40 -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(34, 42, 60, 0.8)" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={isCompliant ? "rgb(52, 211, 153)" : "rgb(251, 191, 36)"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - score)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono text-3xl font-bold ${isCompliant ? "text-accent" : "text-chart-3"}`}>
                {(score * 100).toFixed(1)}%
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">IHSAN SCORE</span>
            </div>
          </div>
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-card border border-border rounded-lg text-center">
            <Eye className="h-5 w-5 text-chart-1 mx-auto mb-2" />
            <div className="font-mono text-lg font-semibold text-foreground">
              {((metrics?.accessibility ?? 0) * 100).toFixed(1)}%
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">Accessibility</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg text-center">
            <Leaf className="h-5 w-5 text-chart-2 mx-auto mb-2" />
            <div className="font-mono text-lg font-semibold text-foreground">
              {((metrics?.sustainability ?? 0) * 100).toFixed(1)}%
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">Sustainability</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg text-center">
            <Target className="h-5 w-5 text-chart-3 mx-auto mb-2" />
            <div className="font-mono text-lg font-semibold text-foreground">
              {((metrics?.intentClarity ?? 0) * 100).toFixed(1)}%
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">Intent Clarity</div>
          </div>
        </div>

        {/* Score History */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Score History (60s)
            </span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="font-mono text-[10px] text-accent">Stable</span>
            </div>
          </div>
          <div className="h-20 flex items-end gap-px">
            {history.map((s, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-150"
                style={{
                  height: `${s * 100}%`,
                  backgroundColor:
                    s >= 0.99 ? "rgb(52, 211, 153)" : s >= 0.95 ? "rgb(251, 191, 36)" : "rgb(239, 68, 68)",
                  opacity: 0.3 + (i / history.length) * 0.7,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[10px] text-muted-foreground">-60s</span>
            <span className="font-mono text-[10px] text-muted-foreground">Now</span>
          </div>
        </div>

        {/* Constraints */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Active Constraints
          </div>
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Min Contrast Ratio</span>
              <span className="text-foreground">{constraints?.minContrastRatio ?? 4.5}:1 (WCAG AA)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max Flicker Rate</span>
              <span className="text-foreground">{constraints?.maxFlickerHz ?? 3} Hz</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max GPU Power</span>
              <span className="text-foreground">{constraints?.maxGpuWatts ?? 15}W sustained</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Min Ihsan Score</span>
              <span className="text-accent">{((constraints?.minIhsanScore ?? 0.99) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Violations */}
        {(metrics?.violations?.length ?? 0) > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-mono text-xs text-destructive uppercase tracking-wider">
                {metrics?.violations.length} Active Violations
              </span>
            </div>
            <div className="space-y-2">
              {metrics?.violations.slice(0, 5).map((v) => (
                <div key={v.id} className="font-mono text-[10px] text-destructive/80">
                  [{v.type.toUpperCase()}] {v.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
