"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type SystemMetrics = {
  consciousness: number
  entropy: number
  stability: number
  activeNodes: number
  tps: number
  blockHeight: number
}

type SystemContextType = {
  metrics: SystemMetrics
  isAwake: boolean
  setAwake: (awake: boolean) => void
}

const SystemContext = createContext<SystemContextType | undefined>(undefined)

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [isAwake, setAwake] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetrics>({
    consciousness: 7.0,
    entropy: 0.004,
    stability: 99.9,
    activeNodes: 72,
    tps: 1450,
    blockHeight: 89234
  })

  // Simulate living system breathing
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        consciousness: +(prev.consciousness + (Math.random() * 0.02 - 0.01)).toFixed(3),
        entropy: +(prev.entropy + (Math.random() * 0.0002 - 0.0001)).toFixed(4),
        stability: +(99.0 + Math.random()).toFixed(2),
        tps: Math.floor(1400 + Math.random() * 200),
        blockHeight: prev.blockHeight + 1
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <SystemContext.Provider value={{ metrics, isAwake, setAwake }}>
      {children}
    </SystemContext.Provider>
  )
}

export const useSystem = () => {
  const context = useContext(SystemContext)
  if (!context) throw new Error("useSystem must be used within a SystemProvider")
  return context
}
