"use client"

import { useState, useEffect, useCallback } from "react"
import { getStateDAG, type StateNode, type DAGMetrics } from "@/lib/state-engine"

export function useStateDAG() {
  const [nodes, setNodes] = useState<StateNode[]>([])
  const [metrics, setMetrics] = useState<DAGMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dag = getStateDAG()

  const refreshData = useCallback(() => {
    setNodes(dag.getAllNodes())
    setMetrics(dag.getMetrics())
  }, [dag])

  useEffect(() => {
    // Initial load
    const timer = setTimeout(() => {
      refreshData()
      setIsLoading(false)
    }, 100)

    // Subscribe to updates
    const unsubscribe = dag.subscribe(() => {
      refreshData()
    })

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [dag, refreshData])

  const createNode = useCallback(
    async (payload: Record<string, unknown>) => {
      return dag.createNode(payload)
    },
    [dag],
  )

  const verifyNode = useCallback(
    async (nodeId: string) => {
      return dag.verifyNode(nodeId)
    },
    [dag],
  )

  return {
    nodes,
    metrics,
    isLoading,
    createNode,
    verifyNode,
    refreshData,
  }
}
