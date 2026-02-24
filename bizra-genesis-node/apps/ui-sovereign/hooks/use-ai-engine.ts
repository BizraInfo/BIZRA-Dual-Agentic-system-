"use client"

import { useState, useEffect, useCallback } from "react"
import { getAIEngine, type OptimizationEvent, type RewriteHistory, type AIMetrics } from "@/lib/ai-engine"

export function useAIEngine() {
  const [optimizations, setOptimizations] = useState<OptimizationEvent[]>([])
  const [rewrites, setRewrites] = useState<RewriteHistory[]>([])
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)

  const engine = getAIEngine()

  const refresh = useCallback(() => {
    setOptimizations(engine.getOptimizations())
    setRewrites(engine.getRewrites())
    setMetrics(engine.getMetrics())
  }, [engine])

  useEffect(() => {
    refresh()
    const unsubscribe = engine.subscribe(refresh)
    return unsubscribe
  }, [engine, refresh])

  return {
    optimizations,
    rewrites,
    metrics,
    refresh,
  }
}
