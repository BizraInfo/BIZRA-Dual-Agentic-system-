"use client"

import { useState } from "react"
import { useAIEngine } from "@/hooks/use-ai-engine"
import { History, FileCode, ArrowRight, CheckCircle, RotateCcw, ChevronDown, ChevronUp, Shield } from "lucide-react"

export function RewriteHistory() {
  const { rewrites } = useAIEngine()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Rewrite History</h2>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{rewrites.length} rewrites</span>
      </div>

      {/* Rewrite List */}
      <div className="flex-1 overflow-y-auto">
        {rewrites.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            No code rewrites yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rewrites.map((rewrite) => (
              <div key={rewrite.id} className="px-4 py-3">
                <button
                  onClick={() => setExpandedId(expandedId === rewrite.id ? null : rewrite.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-chart-1" />
                      <span className="font-mono text-xs text-foreground">{rewrite.targetFile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {rewrite.status === "active" ? (
                        <CheckCircle className="h-3 w-3 text-accent" />
                      ) : (
                        <RotateCcw className="h-3 w-3 text-chart-3" />
                      )}
                      {expandedId === rewrite.id ? (
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <div>
                      <span className="text-muted-foreground">Lines: </span>
                      <span className={rewrite.linesChanged > 0 ? "text-accent" : "text-destructive"}>
                        {rewrite.linesChanged > 0 ? "+" : ""}
                        {rewrite.linesChanged}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Perf: </span>
                      <span className="text-accent">+{rewrite.performanceGain}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-accent" />
                      <span className="text-accent">Ihsan OK</span>
                    </div>
                  </div>
                </button>

                {expandedId === rewrite.id && (
                  <div className="mt-3 space-y-2">
                    {/* Original Code */}
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground mb-1 uppercase">Original</div>
                      <pre className="p-2 bg-destructive/10 border border-destructive/20 rounded text-[10px] font-mono text-destructive/80 overflow-x-auto">
                        {rewrite.originalCode}
                      </pre>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Optimized Code */}
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground mb-1 uppercase">Optimized</div>
                      <pre className="p-2 bg-accent/10 border border-accent/20 rounded text-[10px] font-mono text-accent/80 overflow-x-auto">
                        {rewrite.optimizedCode}
                      </pre>
                    </div>

                    <div className="font-mono text-[10px] text-muted-foreground">
                      Applied: {new Date(rewrite.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe Rewriting Protocol */}
      <div className="px-4 py-2 border-t border-border bg-card/50">
        <div className="font-mono text-[10px] text-muted-foreground">
          <span className="text-foreground">Safe Rewriting Protocol:</span> All changes A/B tested, Ihsan verified,
          auto-rollback enabled
        </div>
      </div>
    </div>
  )
}
