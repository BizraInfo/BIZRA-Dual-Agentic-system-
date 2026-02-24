"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function EcosystemStatusDashboard() {
  const [systemsOnline, setSystemsOnline] = useState(0)
  const [activationProgress, setActivationProgress] = useState(0)

  const systems = [
    { name: "Secure Digital Vault", status: "ONLINE", uptime: "99.97%", color: "bg-yellow-500" },
    { name: "Genesis Node Infrastructure", status: "ONLINE", uptime: "99.99%", color: "bg-blue-500" },
    { name: "Smart Contract Shield", status: "ONLINE", uptime: "100%", color: "bg-green-500" },
    { name: "BZS Token Economy", status: "ONLINE", uptime: "99.95%", color: "bg-purple-500" },
    { name: "AI Agent Network", status: "ONLINE", uptime: "99.98%", color: "bg-cyan-500" },
    { name: "Quantum Consciousness Field", status: "ONLINE", uptime: "99.94%", color: "bg-pink-500" },
    { name: "Collective Intelligence Hub", status: "ONLINE", uptime: "99.96%", color: "bg-indigo-500" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemsOnline((prev) => {
        const next = prev < systems.length ? prev + 1 : systems.length
        setActivationProgress((next / systems.length) * 100)
        return next
      })
    }, 500)

    return () => clearInterval(interval)
  }, [systems.length])

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-serif font-bold text-accent mb-4">BIZRA Ecosystem Status</h3>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xl font-bold text-green-400">ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${activationProgress}%` }}
          ></div>
        </div>
        <p className="text-muted-foreground">Ecosystem Activation: {activationProgress.toFixed(1)}%</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.slice(0, systemsOnline).map((system, index) => (
          <div key={index} className="bg-background/50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${system.color} animate-pulse`}></div>
              <span className="font-semibold text-sm">{system.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-green-400 border-green-400">
                {system.status}
              </Badge>
              <span className="text-xs text-muted-foreground">Uptime: {system.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function GlobalBizraNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<
    Array<{
      x: number
      y: number
      vx: number
      vy: number
      connections: number
      activity: number
      region: string
    }>
  >([])
  const animationRef = useRef<number>()

  const regions = ["North America", "Europe", "Asia Pacific", "Middle East", "Africa", "South America"]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setupCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Initialize nodes representing global BIZRA network
      nodesRef.current = []
      for (let i = 0; i < 50; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          connections: Math.floor(Math.random() * 8) + 2,
          activity: Math.random(),
          region: regions[Math.floor(Math.random() * regions.length)],
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections between nodes
      nodesRef.current.forEach((node, i) => {
        nodesRef.current.slice(i + 1).forEach((otherNode) => {
          const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y)
          if (distance < 150) {
            const opacity = Math.max(0, 1 - distance / 150)
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * 0.3})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Update activity
        node.activity = Math.max(0, node.activity + (Math.random() - 0.5) * 0.1)

        // Draw node
        const radius = 3 + node.activity * 5
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(52, 211, 153, ${0.7 + node.activity * 0.3})`
        ctx.fill()

        // Draw activity pulse
        if (node.activity > 0.7) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(52, 211, 153, ${node.activity * 0.5})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    setupCanvas()
    animate()

    window.addEventListener("resize", setupCanvas)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", setupCanvas)
    }
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-primary/20 p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif font-bold text-primary mb-2">Global BIZRA Network</h3>
        <p className="text-muted-foreground">Real-time planetary consciousness activity</p>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg"
        style={{ background: "radial-gradient(ellipse at center, rgba(30, 64, 175, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {regions.map((region, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-bold text-accent">{Math.floor(Math.random() * 50000) + 10000}</div>
            <div className="text-xs text-muted-foreground">{region} Nodes</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function EcosystemHealthMonitor() {
  const [metrics, setMetrics] = useState({
    networkHealth: 98.7,
    transactionThroughput: 15420,
    aiAgentActivity: 94.2,
    tokenVelocity: 87.5,
    userSatisfaction: 96.8,
    systemLoad: 23.4,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        networkHealth: Math.max(95, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 2)),
        transactionThroughput: Math.max(
          10000,
          Math.min(20000, prev.transactionThroughput + (Math.random() - 0.5) * 1000),
        ),
        aiAgentActivity: Math.max(90, Math.min(100, prev.aiAgentActivity + (Math.random() - 0.5) * 3)),
        tokenVelocity: Math.max(80, Math.min(95, prev.tokenVelocity + (Math.random() - 0.5) * 4)),
        userSatisfaction: Math.max(95, Math.min(100, prev.userSatisfaction + (Math.random() - 0.5) * 1)),
        systemLoad: Math.max(15, Math.min(40, prev.systemLoad + (Math.random() - 0.5) * 5)),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (value: number, isInverted = false) => {
    if (isInverted) {
      if (value < 30) return "text-green-400"
      if (value < 60) return "text-yellow-400"
      return "text-red-400"
    }
    if (value >= 95) return "text-green-400"
    if (value >= 85) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif font-bold text-accent mb-2">Ecosystem Health Monitor</h3>
        <p className="text-muted-foreground">Real-time system performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getHealthColor(metrics.networkHealth)}`}>
            {metrics.networkHealth.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Network Health</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.networkHealth}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold mb-2 text-blue-400">{metrics.transactionThroughput.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Transactions/Hour</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(metrics.transactionThroughput / 20000) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getHealthColor(metrics.aiAgentActivity)}`}>
            {metrics.aiAgentActivity.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">AI Agent Activity</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.aiAgentActivity}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getHealthColor(metrics.tokenVelocity)}`}>
            {metrics.tokenVelocity.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Token Velocity</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.tokenVelocity}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getHealthColor(metrics.userSatisfaction)}`}>
            {metrics.userSatisfaction.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">User Satisfaction</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.userSatisfaction}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getHealthColor(metrics.systemLoad, true)}`}>
            {metrics.systemLoad.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">System Load</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.systemLoad}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function EcosystemActivationCeremony() {
  const [isActivated, setIsActivated] = useState(false)
  const [activationStage, setActivationStage] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const activationStages = [
    "Initializing Quantum Consciousness Field...",
    "Synchronizing AI Agent Networks...",
    "Activating Blockchain Security Protocols...",
    "Establishing Global Node Connections...",
    "Calibrating Token Economy Systems...",
    "Finalizing Ecosystem Integration...",
    "BIZRA Ecosystem Fully Activated!",
  ]

  const handleActivation = () => {
    if (isActivated) return

    let stage = 0
    const interval = setInterval(() => {
      setActivationStage(stage)
      stage++

      if (stage >= activationStages.length) {
        clearInterval(interval)
        setIsActivated(true)
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 5000)
      }
    }, 1500)
  }

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-12 text-center relative overflow-hidden">
      {showCelebration && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 animate-pulse"></div>
      )}

      <div className="relative z-10">
        <h3 className="text-4xl font-serif font-bold luxury-text-gradient mb-8">BIZRA Ecosystem Activation</h3>

        {!isActivated ? (
          <div className="space-y-8">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All Genesis Protocol components are ready. Initiate the final activation to bring the complete BIZRA
              ecosystem online.
            </p>

            {activationStage > 0 && (
              <div className="space-y-4">
                <div className="text-lg text-accent font-semibold">{activationStages[activationStage - 1]}</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(activationStage / activationStages.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <Button
              size="lg"
              onClick={handleActivation}
              disabled={activationStage > 0}
              className="luxury-button-glow bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-serif font-bold px-16 py-8 text-2xl transform hover:scale-105 transition-all duration-500 shadow-2xl"
            >
              {activationStage > 0 ? "Activating..." : "Activate BIZRA Ecosystem"}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-6xl mb-4">🌟</div>
            <h4 className="text-3xl font-bold text-green-400 mb-4">ECOSYSTEM FULLY ACTIVATED!</h4>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              The BIZRA ecosystem is now live and operational. All systems are synchronized, the global network is
              active, and humanity's transformation has begun.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">✓</div>
                <div className="text-sm">Vault Secured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">✓</div>
                <div className="text-sm">Nodes Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">✓</div>
                <div className="text-sm">Shield Deployed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">✓</div>
                <div className="text-sm">Economy Live</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
