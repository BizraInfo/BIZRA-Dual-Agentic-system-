"use client"

import { Card } from "@/components/ui/card"
import { AgentDashboard } from "@/components/agent-dashboard"
import { ConsensusMonitor } from "@/components/consensus-monitor"
import { SystemHealth } from "@/components/system-health"
import { NeuralGarden } from "@/components/neural-garden"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSystem } from "@/lib/system-context"

export function SacredDashboard() {
  const { metrics } = useSystem()

  return (
    <div className="space-y-8">
      {/* Sacred Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Consciousness Level", value: `Level ${metrics.consciousness.toFixed(2)}`, sub: "Ascending" },
          { label: "Quantum Stability", value: `${metrics.stability}%`, sub: "Coherent" },
          { label: "Network Entropy", value: metrics.entropy.toFixed(4), sub: "Optimal" },
          { label: "Active Nodes", value: `${metrics.activeNodes}/72`, sub: "Fully Synced" }
        ].map((metric, i) => (
          <Card key={i} className="bg-[#0A1828]/50 border-[#C9A962]/20 p-4 backdrop-blur-sm hover:border-[#C9A962]/50 transition-colors">
            <p className="text-[#8892b0] text-xs uppercase tracking-widest mb-1">{metric.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-serif text-[#F8F6F1] tabular-nums">{metric.value}</span>
              <span className="text-[#C9A962] text-xs font-mono">{metric.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="command" className="w-full">
        <TabsList className="bg-[#0A1828]/80 border border-[#C9A962]/20 p-1 mb-8">
          <TabsTrigger 
            value="command"
            className="data-[state=active]:bg-[#C9A962] data-[state=active]:text-[#050B14] text-[#8892b0]"
          >
            Command Center
          </TabsTrigger>
          <TabsTrigger 
            value="garden"
            className="data-[state=active]:bg-[#C9A962] data-[state=active]:text-[#050B14] text-[#8892b0]"
          >
            Neural Garden
          </TabsTrigger>
          <TabsTrigger 
            value="network"
            className="data-[state=active]:bg-[#C9A962] data-[state=active]:text-[#050B14] text-[#8892b0]"
          >
            Network Topology
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ConsensusMonitor />
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <AgentDashboard />
            </div>
            <div className="xl:col-span-1">
              <SystemHealth />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="garden" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <NeuralGarden />
        </TabsContent>

        <TabsContent value="network" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="h-[600px] bg-[#0A1828]/50 border-[#C9A962]/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="text-center space-y-4 relative z-10">
              <div className="w-24 h-24 rounded-full border border-[#C9A962] animate-pulse mx-auto flex items-center justify-center">
                <span className="text-4xl">🕸️</span>
              </div>
              <h3 className="text-2xl font-serif text-[#F8F6F1]">Network Topology Visualization</h3>
              <p className="text-[#8892b0]">3D Force-Directed Graph Initializing...</p>
              <p className="text-xs text-[#C9A962] font-mono">Block Height: {metrics.blockHeight}</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
