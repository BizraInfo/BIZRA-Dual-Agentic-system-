"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Network, Shield, Zap, Clock } from 'lucide-react'
import { Card } from "@/components/ui/card"

export function ConsensusMonitor() {
  const [metrics, setMetrics] = useState({
    quorum: 87,
    latency: 42,
    tps: 156,
    blocks: 1245892
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        quorum: Math.min(100, Math.max(80, prev.quorum + (Math.random() - 0.5) * 2)),
        latency: Math.max(20, prev.latency + (Math.random() - 0.5) * 5),
        tps: Math.max(100, prev.tps + (Math.random() - 0.5) * 10),
        blocks: prev.blocks + 1
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-navy-900/40 border-gold-500/20 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-navy-300 text-xs uppercase tracking-wider">Network Quorum</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-mono text-gold-100">{metrics.quorum.toFixed(1)}%</div>
          <div className="w-full h-1 bg-navy-800 mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${metrics.quorum}%` }} />
          </div>
        </div>
      </Card>

      <Card className="bg-navy-900/40 border-gold-500/20 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-navy-300 text-xs uppercase tracking-wider">Latency</span>
            <Zap className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-mono text-gold-100">{metrics.latency.toFixed(0)}ms</div>
          <div className="text-xs text-green-400 mt-1">Optimal Range</div>
        </div>
      </Card>

      <Card className="bg-navy-900/40 border-gold-500/20 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-navy-300 text-xs uppercase tracking-wider">Throughput</span>
            <Network className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono text-gold-100">{metrics.tps.toFixed(0)} TPS</div>
          <div className="text-xs text-purple-400 mt-1">+12% vs avg</div>
        </div>
      </Card>

      <Card className="bg-navy-900/40 border-gold-500/20 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-navy-300 text-xs uppercase tracking-wider">Block Height</span>
            <Clock className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-mono text-gold-100">#{metrics.blocks.toLocaleString()}</div>
          <div className="text-xs text-gold-400 mt-1">Finalized</div>
        </div>
      </Card>
    </div>
  )
}
