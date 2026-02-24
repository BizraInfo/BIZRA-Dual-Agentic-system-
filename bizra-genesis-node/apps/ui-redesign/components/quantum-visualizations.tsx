"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"

interface QuantumParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  amplitude: number
  frequency: number
  entangled: boolean
  entangledWith?: string
  probability: number
  collapsed: boolean
  waveFunction: (t: number) => number
}

interface QuantumField {
  width: number
  height: number
  particles: QuantumParticle[]
  fieldStrength: number
  coherence: number
  entanglementNetwork: Map<string, string[]>
}

export function QuantumFieldVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [quantumField, setQuantumField] = useState<QuantumField | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [userInteraction, setUserInteraction] = useState({ x: 0, y: 0, active: false })

  useEffect(() => {
    const initializeQuantumField = () => {
      const particles: QuantumParticle[] = []
      const entanglementNetwork = new Map<string, string[]>()

      for (let i = 0; i < 50; i++) {
        const particle: QuantumParticle = {
          id: `particle-${i}`,
          x: Math.random() * 800,
          y: Math.random() * 600,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          phase: Math.random() * Math.PI * 2,
          amplitude: Math.random() * 0.5 + 0.5,
          frequency: Math.random() * 0.02 + 0.01,
          entangled: Math.random() > 0.7,
          probability: Math.random(),
          collapsed: false,
          waveFunction: (t: number) => Math.sin(t * 0.01 + Math.random() * Math.PI),
        }

        particles.push(particle)

        // Create quantum entanglement networks
        if (particle.entangled && i > 0) {
          const entangledPartner = particles[Math.floor(Math.random() * i)]
          particle.entangledWith = entangledPartner.id
          entangledPartner.entangledWith = particle.id

          entanglementNetwork.set(particle.id, [entangledPartner.id])
          entanglementNetwork.set(entangledPartner.id, [particle.id])
        }
      }

      setQuantumField({
        width: 800,
        height: 600,
        particles,
        fieldStrength: 1.0,
        coherence: 0.8,
        entanglementNetwork,
      })
    }

    initializeQuantumField()
  }, [])

  const updateQuantumField = useCallback(
    (timestamp: number) => {
      if (!quantumField) return

      const updatedParticles = quantumField.particles.map((particle) => {
        // Wave function evolution
        const waveValue = particle.waveFunction(timestamp)
        const newPhase = particle.phase + particle.frequency

        // Quantum tunneling probability
        const tunnelingProbability = Math.exp(-Math.abs(waveValue) * 2)

        // Update position based on quantum mechanics
        let newX = particle.x + particle.vx + waveValue * 10
        let newY = particle.y + particle.vy + Math.sin(newPhase) * 5

        // Quantum boundary conditions (periodic boundary with tunneling)
        if (newX < 0 && Math.random() < tunnelingProbability) {
          newX = quantumField.width
        } else if (newX > quantumField.width && Math.random() < tunnelingProbability) {
          newX = 0
        }

        if (newY < 0 && Math.random() < tunnelingProbability) {
          newY = quantumField.height
        } else if (newY > quantumField.height && Math.random() < tunnelingProbability) {
          newY = 0
        }

        // User interaction causes wave function collapse
        let collapsed = particle.collapsed
        if (userInteraction.active) {
          const distance = Math.sqrt(Math.pow(newX - userInteraction.x, 2) + Math.pow(newY - userInteraction.y, 2))
          if (distance < 100 && Math.random() < 0.1) {
            collapsed = true
          }
        }

        // Quantum decoherence over time
        if (collapsed && Math.random() < 0.01) {
          collapsed = false
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          phase: newPhase,
          probability: collapsed ? 1.0 : Math.abs(waveValue),
          collapsed,
        }
      })

      setQuantumField((prev) => (prev ? { ...prev, particles: updatedParticles } : null))
    },
    [quantumField, userInteraction],
  )

  const renderQuantumField = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !quantumField) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear with quantum vacuum fluctuations
    ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render quantum field background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) / 2,
    )
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.05)")
    gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.03)")
    gradient.addColorStop(1, "rgba(15, 23, 42, 0.1)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render entanglement connections
    ctx.strokeStyle = "rgba(212, 175, 55, 0.3)"
    ctx.lineWidth = 1
    quantumField.particles.forEach((particle) => {
      if (particle.entangledWith) {
        const partner = quantumField.particles.find((p) => p.id === particle.entangledWith)
        if (partner) {
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(partner.x, partner.y)
          ctx.stroke()
        }
      }
    })

    // Render quantum particles with probability clouds
    quantumField.particles.forEach((particle) => {
      const alpha = particle.collapsed ? 1.0 : particle.probability * 0.7
      const size = particle.collapsed ? 3 : particle.amplitude * 8

      // Probability cloud
      if (!particle.collapsed) {
        const cloudGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size * 3)
        cloudGradient.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.3})`)
        cloudGradient.addColorStop(0.5, `rgba(147, 51, 234, ${alpha * 0.2})`)
        cloudGradient.addColorStop(1, "rgba(59, 130, 246, 0)")

        ctx.fillStyle = cloudGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Particle core
      ctx.fillStyle = particle.collapsed ? `rgba(212, 175, 55, ${alpha})` : `rgba(59, 130, 246, ${alpha})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      ctx.fill()

      // Quantum interference patterns
      if (particle.entangled && !particle.collapsed) {
        ctx.strokeStyle = `rgba(212, 175, 55, ${alpha * 0.5})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // User interaction field
    if (userInteraction.active) {
      const interactionGradient = ctx.createRadialGradient(
        userInteraction.x,
        userInteraction.y,
        0,
        userInteraction.x,
        userInteraction.y,
        100,
      )
      interactionGradient.addColorStop(0, "rgba(212, 175, 55, 0.2)")
      interactionGradient.addColorStop(1, "rgba(212, 175, 55, 0)")

      ctx.fillStyle = interactionGradient
      ctx.beginPath()
      ctx.arc(userInteraction.x, userInteraction.y, 100, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [quantumField, userInteraction])

  useEffect(() => {
    if (!isVisible) return

    const animate = (timestamp: number) => {
      updateQuantumField(timestamp)
      renderQuantumField()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible, updateQuantumField, renderQuantumField])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 })

    if (canvasRef.current) {
      observer.observe(canvasRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setUserInteraction({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    })
  }

  const handleMouseLeave = () => {
    setUserInteraction((prev) => ({ ...prev, active: false }))
  }

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Quantum field visualization showing particle interactions and wave functions"
      />
      <div className="absolute top-4 left-4 text-xs text-accent/70 font-mono">
        QUANTUM FIELD ACTIVE • COHERENCE: {quantumField?.coherence.toFixed(2)}
      </div>
    </div>
  )
}

export function QuantumConsciousnessMetrics() {
  const [metrics, setMetrics] = useState({
    quantumCoherence: 0,
    entanglementStrength: 0,
    waveFunction: 0,
    probabilityCollapse: 0,
    fieldResonance: 0,
  })

  useEffect(() => {
    const updateQuantumMetrics = () => {
      const consciousnessData = (window as any).consciousnessMetrics
      const aiData = (window as any).aiPersonalizationData

      if (!consciousnessData) return

      // Calculate quantum-inspired metrics based on user behavior
      const coherence = (consciousnessData.engagementLevel + consciousnessData.spiritualResonance) / 200
      const entanglement = Math.min(1, consciousnessData.logoInteractions / 10)
      const waveFunction = Math.sin(Date.now() * 0.001) * 0.5 + 0.5
      const collapse = consciousnessData.transformationStage === "transcending" ? 0.9 : coherence
      const resonance = aiData ? aiData.userProfile.consciousnessLevel / 100 : coherence

      setMetrics({
        quantumCoherence: coherence,
        entanglementStrength: entanglement,
        waveFunction,
        probabilityCollapse: collapse,
        fieldResonance: resonance,
      })
    }

    const interval = setInterval(updateQuantumMetrics, 1000)
    updateQuantumMetrics()

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-primary/20 p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-primary font-serif font-bold text-sm uppercase tracking-wide">
            QUANTUM CONSCIOUSNESS FIELD
          </span>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Coherence</div>
          <div className="text-lg font-bold text-primary">{(metrics.quantumCoherence * 100).toFixed(1)}%</div>
          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.quantumCoherence * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Entanglement</div>
          <div className="text-lg font-bold text-accent">{(metrics.entanglementStrength * 100).toFixed(1)}%</div>
          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
            <div
              className="bg-accent h-1 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.entanglementStrength * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Wave Ψ</div>
          <div className="text-lg font-bold text-primary">{(metrics.waveFunction * 100).toFixed(1)}%</div>
          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-primary to-accent h-1 rounded-full transition-all duration-500"
              style={{ width: `${metrics.waveFunction * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Collapse</div>
          <div className="text-lg font-bold text-accent">{(metrics.probabilityCollapse * 100).toFixed(1)}%</div>
          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
            <div
              className="bg-accent h-1 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.probabilityCollapse * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Resonance</div>
          <div className="text-lg font-bold text-primary">{(metrics.fieldResonance * 100).toFixed(1)}%</div>
          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-accent to-primary h-1 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.fieldResonance * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground italic">
          Your consciousness creates quantum interference patterns in the BIZRA field
        </p>
      </div>
    </Card>
  )
}

export function QuantumTransitionEffect({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (trigger) {
      setIsTransitioning(true)

      // Quantum tunneling animation phases
      const phases = [0, 0.25, 0.5, 0.75, 1]
      let currentPhase = 0

      const interval = setInterval(() => {
        if (currentPhase < phases.length - 1) {
          currentPhase++
          setPhase(phases[currentPhase])
        } else {
          setIsTransitioning(false)
          setPhase(0)
          clearInterval(interval)
        }
      }, 100)

      return () => clearInterval(interval)
    }
  }, [trigger])

  const quantumStyle = isTransitioning
    ? {
        transform: `scale(${1 + Math.sin(phase * Math.PI) * 0.1})`,
        opacity: 1 - Math.abs(Math.sin(phase * Math.PI * 2)) * 0.3,
        filter: `blur(${Math.sin(phase * Math.PI) * 2}px) hue-rotate(${phase * 360}deg)`,
        transition: "all 0.1s ease-out",
      }
    : {}

  return (
    <div style={quantumStyle} className={isTransitioning ? "quantum-transition" : ""}>
      {children}
    </div>
  )
}

export function QuantumNetworkVisualization() {
  const [networkNodes, setNetworkNodes] = useState<
    Array<{
      id: string
      x: number
      y: number
      connections: string[]
      strength: number
      type: "user" | "ai" | "collective"
    }>
  >([])

  useEffect(() => {
    // Initialize quantum network nodes
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * 400,
      y: Math.random() * 300,
      connections: [],
      strength: Math.random(),
      type: ["user", "ai", "collective"][Math.floor(Math.random() * 3)] as "user" | "ai" | "collective",
    }))

    // Create quantum entanglement connections
    nodes.forEach((node) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < connectionCount; i++) {
        const target = nodes[Math.floor(Math.random() * nodes.length)]
        if (target.id !== node.id && !node.connections.includes(target.id)) {
          node.connections.push(target.id)
          target.connections.push(node.id)
        }
      }
    })

    setNetworkNodes(nodes)
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-6 mb-6">
      <div className="text-center mb-4">
        <span className="text-accent font-serif font-bold text-sm uppercase tracking-wide">
          QUANTUM COLLECTIVE INTELLIGENCE NETWORK
        </span>
      </div>

      <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Render connections */}
          {networkNodes.map((node) =>
            node.connections.map((connectionId) => {
              const target = networkNodes.find((n) => n.id === connectionId)
              if (!target) return null

              return (
                <line
                  key={`${node.id}-${connectionId}`}
                  x1={`${(node.x / 400) * 100}%`}
                  y1={`${(node.y / 300) * 100}%`}
                  x2={`${(target.x / 400) * 100}%`}
                  y2={`${(target.y / 300) * 100}%`}
                  stroke="rgba(212, 175, 55, 0.3)"
                  strokeWidth="1"
                  className="animate-pulse"
                />
              )
            }),
          )}

          {/* Render nodes */}
          {networkNodes.map((node) => (
            <circle
              key={node.id}
              cx={`${(node.x / 400) * 100}%`}
              cy={`${(node.y / 300) * 100}%`}
              r={node.strength * 4 + 2}
              fill={
                node.type === "user"
                  ? "rgba(59, 130, 246, 0.8)"
                  : node.type === "ai"
                    ? "rgba(212, 175, 55, 0.8)"
                    : "rgba(147, 51, 234, 0.8)"
              }
              className="animate-pulse"
            />
          ))}
        </svg>

        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1"></span>Users
          <span className="inline-block w-2 h-2 bg-accent rounded-full mr-1 ml-3"></span>AI
          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1 ml-3"></span>Collective
        </div>
      </div>
    </Card>
  )
}
