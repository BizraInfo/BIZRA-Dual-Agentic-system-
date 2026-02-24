"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useSystem } from "@/lib/system-context"

type AgentNode = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  type: "Analyst" | "Creator" | "Guardian"
  status: "active" | "dormant"
  connections: number[]
}

export function NeuralGarden() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null)
  const { metrics } = useSystem()
  const agentsRef = useRef<AgentNode[]>([])

  // Initialize Agents
  useEffect(() => {
    if (agentsRef.current.length > 0) return

    const types: ("Analyst" | "Creator" | "Guardian")[] = ["Analyst", "Creator", "Guardian"]
    
    agentsRef.current = Array.from({ length: 72 }, (_, i) => ({
      id: i + 1,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 2,
      type: types[i % 3],
      status: Math.random() > 0.2 ? "active" : "dormant",
      connections: []
    }))

    // Create random connections
    agentsRef.current.forEach(agent => {
      const numConnections = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < numConnections; i++) {
        const targetId = Math.floor(Math.random() * 72)
        if (targetId !== agent.id - 1) {
          agent.connections.push(targetId)
        }
      }
    })
  }, [])

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and Draw Agents
      agentsRef.current.forEach((agent, i) => {
        // Movement
        agent.x += agent.vx
        agent.y += agent.vy

        // Bounce off walls
        if (agent.x < 0 || agent.x > canvas.width) agent.vx *= -1
        if (agent.y < 0 || agent.y > canvas.height) agent.vy *= -1

        // Draw Connections
        ctx.beginPath()
        agent.connections.forEach(targetIdx => {
          const target = agentsRef.current[targetIdx]
          if (target) {
            const dist = Math.hypot(target.x - agent.x, target.y - agent.y)
            if (dist < 150) {
              ctx.moveTo(agent.x, agent.y)
              ctx.lineTo(target.x, target.y)
              ctx.strokeStyle = `rgba(201, 169, 98, ${0.1 * (1 - dist / 150)})`
              ctx.lineWidth = 0.5
            }
          }
        })
        ctx.stroke()

        // Draw Node
        ctx.beginPath()
        ctx.arc(agent.x, agent.y, agent.radius * (agent.id === selectedAgent?.id ? 2 : 1), 0, Math.PI * 2)
        ctx.fillStyle = agent.status === "active" ? "#C9A962" : "#1A2C42"
        ctx.fill()
        
        // Glow for active nodes
        if (agent.status === "active") {
          ctx.shadowBlur = 10
          ctx.shadowColor = "#C9A962"
        } else {
          ctx.shadowBlur = 0
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [selectedAgent])

  // Interaction Handler
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked agent
    const clicked = agentsRef.current.find(agent => {
      const dist = Math.hypot(agent.x - x, agent.y - y)
      return dist < 20 // Hit radius
    })

    setSelectedAgent(clicked || null)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-[#F8F6F1] mb-2">Neural Garden</h2>
          <p className="text-[#8892b0]">Visualizing the 72-Agent Collective Consciousness</p>
        </div>
        <div className="flex gap-4 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C9A962] animate-pulse" /> 
            Active ({metrics.activeNodes})
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1A2C42]" /> Dormant
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Interactive Canvas */}
        <Card className="lg:col-span-2 bg-[#0A1828]/50 border-[#C9A962]/20 relative overflow-hidden backdrop-blur-sm" ref={containerRef}>
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          />
          <div className="absolute bottom-4 right-4 text-xs text-[#C9A962]/50 font-mono pointer-events-none">
            LIVE SIMULATION • {metrics.tps} TPS
          </div>
        </Card>

        {/* Agent Details Panel */}
        <Card className="bg-[#0A1828]/80 border-[#C9A962]/20 p-6 backdrop-blur-md flex flex-col">
          {selectedAgent ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedAgent.id}
              className="space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-[#C9A962]/10 border border-[#C9A962] flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 rounded-full border border-[#C9A962] animate-ping opacity-20" />
                <span className="text-2xl font-serif text-[#C9A962]">{selectedAgent.id}</span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-serif text-[#F8F6F1]">Agent {String(selectedAgent.id).padStart(2, '0')}</h3>
                <p className="text-[#C9A962] font-mono text-sm uppercase tracking-widest">{selectedAgent.type}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#C9A962]/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8892b0]">Status</span>
                  <span className={selectedAgent.status === "active" ? "text-[#C9A962]" : "text-gray-500"}>
                    {selectedAgent.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8892b0]">Coherence</span>
                  <span className="text-[#F8F6F1]">{metrics.stability}%</span>
                </div>
                <div className="w-full bg-[#050B14] h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#C9A962]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.stability}%` }}
                  />
                </div>
              </div>
              
              <div className="pt-4 bg-[#050B14]/50 p-4 rounded border border-[#C9A962]/10">
                <p className="text-xs text-[#8892b0] font-mono">
                  <span className="text-[#C9A962]">{">"}</span> Processing block #{metrics.blockHeight}...
                  <br />
                  <span className="text-[#C9A962]">{">"}</span> Validating consensus proof...
                  <br />
                  <span className="text-green-500">{">"}</span> Synced.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#8892b0] space-y-4">
              <div className="w-16 h-16 rounded-full border border-dashed border-[#C9A962]/30 flex items-center justify-center animate-spin-slow">
                <div className="w-2 h-2 bg-[#C9A962] rounded-full" />
              </div>
              <p>Select a node from the neural garden to inspect consciousness data.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
