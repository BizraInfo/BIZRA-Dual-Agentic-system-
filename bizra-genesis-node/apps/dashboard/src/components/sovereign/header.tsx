"use client"

import { Activity, Cpu, Zap } from "lucide-react"
import { usePerformance } from "@/hooks/use-performance"
import { useIhsan } from "@/hooks/use-ihsan"
import { SeedOfLife } from "./seed-of-life"

export function SovereignHeader() {
  const performance = usePerformance()
  const { metrics: ihsan } = useIhsan()

  const ihsanScore = ihsan?.overallScore ?? 0
  const ihsanStatus = ihsanScore >= 0.99 ? "COMPLIANT" : ihsanScore >= 0.95 ? "WARNING" : "VIOLATION"

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SeedOfLife size={28} animated={false} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            <div>
              <h1 className="font-serif text-lg tracking-wider text-[#C9A962]">BIZRA</h1>
              <p className="font-mono text-[10px] text-muted-foreground">SOVEREIGN INTERFACE PROTOCOL</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-muted-foreground">v1.0.0</span>
            <span className="text-border">|</span>
            <span className="text-[#C9A962]/60">MAINNET</span>
          </div>
        </div>

        {/* Real-time Metrics Bar */}
        <div className="flex items-center gap-6">
          {/* FPS */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#C9A962]" />
            <div className="font-mono text-xs">
              <span className="text-foreground">{performance.fps}</span>
              <span className="text-muted-foreground"> FPS</span>
            </div>
          </div>

          {/* Frame Time */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-3" />
            <div className="font-mono text-xs">
              <span className="text-foreground">{performance.frameTime}</span>
              <span className="text-muted-foreground"> ms</span>
            </div>
          </div>

          {/* CPU */}
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent" />
            <div className="font-mono text-xs">
              <span className="text-foreground">{performance.cpuEstimate}</span>
              <span className="text-muted-foreground">%</span>
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                ihsanStatus === "COMPLIANT"
                  ? "bg-[#C9A962]"
                  : ihsanStatus === "WARNING"
                    ? "bg-chart-3"
                    : "bg-destructive"
              } animate-pulse`}
            />
            <div className="font-mono text-xs">
              <span className="text-muted-foreground">IHSAN:</span>
              <span
                className={`ml-1 ${
                  ihsanStatus === "COMPLIANT"
                    ? "text-[#C9A962]"
                    : ihsanStatus === "WARNING"
                      ? "text-chart-3"
                      : "text-destructive"
                }`}
              >
                {(ihsanScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Arabic label for Ihsan */}
          <div className="font-arabic text-sm text-[#C9A962]/40">الإحسان</div>

          {/* Timestamp */}
          <div className="font-mono text-[10px] text-muted-foreground">
            {new Date().toISOString().split("T")[1].split(".")[0]} UTC
          </div>
        </div>
      </div>
    </header>
  )
}
