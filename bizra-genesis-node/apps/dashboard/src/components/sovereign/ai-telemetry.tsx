"use client"

import { useAIEngine } from "@/hooks/use-ai-engine"
import {
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
  Zap,
  MemoryStick as Memory,
  Network,
  Layers,
} from "lucide-react"

const typeIcons = {
  animation: Zap,
  layout: Layers,
  memory: Memory,
  network: Network,
}

const statusColors = {
  proposed: "text-chart-3",
  testing: "text-chart-1",
  deployed: "text-accent",
  rejected: "text-destructive",
}

const statusIcons = {
  proposed: Lightbulb,
  testing: Loader2,
  deployed: CheckCircle,
  rejected: XCircle,
}

export function AITelemetry() {
  const { optimizations, metrics } = useAIEngine()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-chart-4" />
          <h2 className="font-mono text-sm text-foreground">AI Optimization Telemetry</h2>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-chart-4 animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground">{metrics?.modelVersion}</span>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-border">
        <div className="text-center">
          <div className="font-mono text-xl font-semibold text-foreground">{metrics?.totalOptimizations ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xl font-semibold text-accent">{metrics?.successfulOptimizations ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Deployed</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xl font-semibold text-chart-2">+{metrics?.averageImprovement ?? 0}%</div>
          <div className="font-mono text-[10px] text-muted-foreground">Avg Gain</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xl font-semibold text-foreground">{metrics?.confidenceThreshold ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Threshold</div>
        </div>
      </div>

      {/* Optimization Feed */}
      <div className="flex-1 overflow-y-auto">
        {optimizations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            Awaiting optimization proposals...
          </div>
        ) : (
          <div className="divide-y divide-border">
            {optimizations.map((opt) => {
              const TypeIcon = typeIcons[opt.type]
              const StatusIcon = statusIcons[opt.status]

              return (
                <div key={opt.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-chart-1" />
                      <span className="font-mono text-xs text-foreground uppercase">{opt.type}</span>
                      <StatusIcon
                        className={`h-4 w-4 ${statusColors[opt.status]} ${opt.status === "testing" ? "animate-spin" : ""}`}
                      />
                      <span className={`font-mono text-[10px] ${statusColors[opt.status]}`}>{opt.status}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(opt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-muted-foreground mb-2">{opt.hypothesis}</p>

                  {opt.status === "deployed" && (
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        <span className="text-accent">+{opt.improvement}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">FPS: </span>
                        <span className="text-foreground">
                          {opt.beforeMetrics.fps.toFixed(0)} → {opt.afterMetrics.fps.toFixed(0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency: </span>
                        <span className="text-foreground">
                          {opt.beforeMetrics.latency.toFixed(0)}ms → {opt.afterMetrics.latency.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">
            Last: {metrics?.lastOptimizationTime ? new Date(metrics.lastOptimizationTime).toLocaleTimeString() : "N/A"}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          Success Rate:{" "}
          {metrics && metrics.totalOptimizations > 0
            ? ((metrics.successfulOptimizations / metrics.totalOptimizations) * 100).toFixed(0)
            : 0}
          %
        </span>
      </div>
    </div>
  )
}
