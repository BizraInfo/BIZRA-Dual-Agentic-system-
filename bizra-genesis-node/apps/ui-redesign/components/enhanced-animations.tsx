"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"

export function useAnimatedCounter(end: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)

  useEffect(() => {
    if (!shouldStart) return

    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const currentCount = Math.floor(progress * end)

      if (currentCount !== countRef.current) {
        countRef.current = currentCount
        setCount(currentCount)
      }

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration, shouldStart])

  return count
}

export function AITeamVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: undefined as number | undefined, y: undefined as number | undefined })
  const animationRef = useRef<number>()

  const agents = [
    "Master Reasoner",
    "Memory Architect",
    "Creative Synthesizer",
    "Data Analyst",
    "Communication Expert",
    "Strategic Planner",
    "Ethics Guardian",
  ]

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.x = undefined
    mouseRef.current.y = undefined
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setupCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) * 0.6

      // Draw connections to center
      agents.forEach((agent, i) => {
        const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = "rgba(212, 175, 55, 0.2)"
        ctx.lineWidth = 2
        ctx.stroke()

        // Calculate distance to mouse for hover effect
        const dist =
          mouseRef.current.x !== undefined && mouseRef.current.y !== undefined
            ? Math.hypot(x - mouseRef.current.x, y - mouseRef.current.y)
            : Number.POSITIVE_INFINITY
        const isHovered = dist < 50
        const nodeRadius = isHovered ? 15 : 10

        // Draw agent nodes
        ctx.beginPath()
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)
        ctx.fillStyle = isHovered ? "#34d399" : "#38bdf8"
        ctx.fill()

        // Draw agent labels
        ctx.fillStyle = "#e2e8f0"
        ctx.font = "12px Inter"
        ctx.textAlign = "center"
        ctx.fillText(agent, x, y + nodeRadius + 20)
      })

      // Draw center node (YOU)
      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
      ctx.fillStyle = "#1e40af"
      ctx.fill()

      ctx.fillStyle = "white"
      ctx.font = 'bold 14px "Space Grotesk"'
      ctx.textAlign = "center"
      ctx.fillText("YOU", centerX, centerY + 5)

      animationRef.current = requestAnimationFrame(animate)
    }

    setupCanvas()
    animate()

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", setupCanvas)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", setupCanvas)
    }
  }, [agents, handleMouseMove, handleMouseLeave])

  return (
    <Card className="luxury-glass-morphism border border-primary/20 p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif font-bold text-accent mb-2">Your AI Dream Team</h3>
        <p className="text-muted-foreground">Hover over each agent to see their specialization</p>
      </div>
      <canvas ref={canvasRef} className="w-full h-[400px] cursor-pointer" style={{ maxWidth: "100%" }} />
    </Card>
  )
}

export function ProofOfImpactVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      life: number
      type: "deed" | "token"
    }>
  >([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setupCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new particles occasionally
      if (Math.random() > 0.95 && particlesRef.current.length < 30) {
        particlesRef.current.push({
          x: 0,
          y: canvas.height / 2 + (Math.random() - 0.5) * 50,
          life: 1,
          type: "deed",
        })
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += 2
        p.life -= 0.01

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }

        // Transform deed to token at midpoint
        if (p.type === "deed" && p.x > canvas.width / 2) {
          p.type = "token"
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.type === "deed" ? 4 : 6, 0, Math.PI * 2)
        ctx.fillStyle = p.type === "deed" ? `rgba(56, 189, 248, ${p.life})` : `rgba(212, 175, 55, ${p.life})`
        ctx.fill()
      }

      // Draw transformation line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, 0)
      ctx.lineTo(canvas.width / 2, canvas.height)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw labels
      ctx.fillStyle = "#e2e8f0"
      ctx.font = "14px Inter"
      ctx.textAlign = "center"
      ctx.fillText("Good Deeds", canvas.width * 0.25, 30)
      ctx.fillText("BZS Tokens", canvas.width * 0.75, 30)

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
    <Card className="luxury-glass-morphism border border-accent/20 p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif font-bold text-primary mb-2">Proof of Impact</h3>
        <p className="text-muted-foreground">Watch good deeds transform into BZS tokens</p>
      </div>
      <canvas ref={canvasRef} className="w-full h-[200px]" style={{ maxWidth: "100%" }} />
    </Card>
  )
}

export function EnhancedStatistics() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filesProcessed = useAnimatedCounter(500000, 2000, isVisible)
  const researchProjects = useAnimatedCounter(180, 2000, isVisible)
  const toolsDeveloped = useAnimatedCounter(250, 2000, isVisible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="luxury-glass-morphism border border-primary/20 p-8 text-center">
        <p className="text-6xl font-bold luxury-text-gradient mb-2">{filesProcessed.toLocaleString()}</p>
        <p className="text-xl font-serif text-muted-foreground">Files Processed</p>
      </Card>

      <Card className="luxury-glass-morphism border border-accent/20 p-8 text-center">
        <p className="text-6xl font-bold luxury-text-gradient mb-2">{researchProjects}</p>
        <p className="text-xl font-serif text-muted-foreground">Research Projects</p>
      </Card>

      <Card className="luxury-glass-morphism border border-primary/20 p-8 text-center">
        <p className="text-6xl font-bold luxury-text-gradient mb-2">{toolsDeveloped}</p>
        <p className="text-xl font-serif text-muted-foreground">Tools Developed</p>
      </Card>
    </div>
  )
}
