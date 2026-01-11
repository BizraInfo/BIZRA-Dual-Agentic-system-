"use client"

import { useState, useEffect, useCallback } from "react"
import { getProofEngine, type Proof, type ProofMetrics } from "@/lib/proof-engine"

export function useProofEngine() {
  const [proofs, setProofs] = useState<Proof[]>([])
  const [metrics, setMetrics] = useState<ProofMetrics | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const engine = getProofEngine()

  const refreshData = useCallback(() => {
    setProofs(engine.getRecentProofs())
    setMetrics(engine.getMetrics())
  }, [engine])

  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      refreshData()
    })

    refreshData()

    return unsubscribe
  }, [engine, refreshData])

  const generateProof = useCallback(
    async (circuitId: string, publicInputs: string[]) => {
      setIsGenerating(true)
      try {
        const proof = await engine.generateProof(circuitId, publicInputs, {})
        return proof
      } finally {
        setIsGenerating(false)
      }
    },
    [engine],
  )

  return {
    proofs,
    metrics,
    isGenerating,
    generateProof,
    refreshData,
  }
}
