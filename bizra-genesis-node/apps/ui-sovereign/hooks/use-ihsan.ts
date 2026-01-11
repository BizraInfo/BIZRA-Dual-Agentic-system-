"use client"

import { useState, useEffect, useCallback } from "react"
import { getIhsanEngine, type IhsanMetrics, type IhsanConstraints } from "@/lib/ihsan-engine"
import { fetchFromApi, type MasterpieceSeal } from "@/lib/api-client"

export function useIhsan() {
  const [metrics, setMetrics] = useState<IhsanMetrics | null>(null)
  const [constraints, setConstraintsState] = useState<IhsanConstraints | null>(null)
  const [seal, setSeal] = useState<MasterpieceSeal | null>(null)

  const engine = getIhsanEngine()

  useEffect(() => {
    // Fetch Seal
    fetchFromApi<MasterpieceSeal>("/api/masterpiece/seal")
      .then(setSeal)
      .catch(err => console.error("Failed to fetch Masterpiece Seal:", err))

    const unsubscribe = engine.subscribe((newMetrics) => {
      setMetrics(newMetrics)
    })

    // Initial check
    setMetrics(engine.checkConstraints())
    setConstraintsState(engine.getConstraints())

    // Periodic checks
    const interval = setInterval(() => {
      engine.checkConstraints()
    }, 2000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [engine])

  const checkNow = useCallback(() => {
    return engine.checkConstraints()
  }, [engine])

  const updateConstraints = useCallback(
    (updates: Partial<IhsanConstraints>) => {
      engine.updateConstraints(updates)
      setConstraintsState(engine.getConstraints())
    },
    [engine],
  )

  return {
    metrics,
    constraints,
    seal,
    checkNow,
    updateConstraints,
  }
}
