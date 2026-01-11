"use client"

import { useEffect, useRef, useState } from "react"

interface LuxuryParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  type: "navy" | "gold" | "white"
}

export function LuxuryParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<LuxuryParticle[]>([])
  const animationRef = useRef<number>()
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    const checkPerformance = () => {
      const connection = (navigator as any).connection
      const memory = (navigator as any).deviceMemory

      if (connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g" || memory < 4) {
        setIsLowPerformance(true)
      }
    }

    checkPerformance()

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || isLowPerformance) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(canvas)

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createLuxuryParticles = () => {
      const particles: LuxuryParticle[] = []
      const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000))

      for (let i = 0; i < particleCount; i++) {
        const type = Math.random() < 0.6 ? "navy" : Math.random() < 0.8 ? "gold" : "white"
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2, // Reduced velocity for smoother performance
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 3 + 1, // Slightly smaller particles
          opacity: Math.random() * 0.3 + 0.1, // Reduced opacity for subtlety
          hue: type === "navy" ? 240 : type === "gold" ? 45 : 0,
          type,
        })
      }
      particlesRef.current = particles
    }

    const animate = () => {
      if (!isVisible) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        // Update position with luxury floating motion
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges elegantly
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Luxury pulsing opacity
        particle.opacity = 0.1 + Math.sin(Date.now() * 0.0005 + index) * 0.2 // Slower, more subtle pulsing

        // Draw luxury particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2.5,
        )

        if (particle.type === "navy") {
          gradient.addColorStop(0, `hsla(240, 100%, 25%, ${particle.opacity})`)
          gradient.addColorStop(1, `hsla(240, 100%, 25%, 0)`)
        } else if (particle.type === "gold") {
          gradient.addColorStop(0, `hsla(45, 100%, 65%, ${particle.opacity})`)
          gradient.addColorStop(1, `hsla(45, 100%, 65%, 0)`)
        } else {
          gradient.addColorStop(0, `hsla(0, 0%, 100%, ${particle.opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(0, 0%, 100%, 0)`)
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        if (index % 3 === 0) {
          particlesRef.current.forEach((otherParticle, otherIndex) => {
            if (index !== otherIndex && otherIndex > index) {
              // Avoid duplicate connections
              const dx = particle.x - otherParticle.x
              const dy = particle.y - otherParticle.y
              const distance = Math.sqrt(dx * dx + dy * dy)

              if (distance < 100) {
                // Reduced connection distance for performance
                ctx.beginPath()
                ctx.moveTo(particle.x, particle.y)
                ctx.lineTo(otherParticle.x, otherParticle.y)

                const connectionOpacity = 0.05 * (1 - distance / 100) // More subtle connections
                if (particle.type === "gold" || otherParticle.type === "gold") {
                  ctx.strokeStyle = `hsla(45, 100%, 65%, ${connectionOpacity})`
                } else {
                  ctx.strokeStyle = `hsla(240, 100%, 25%, ${connectionOpacity})`
                }
                ctx.lineWidth = 0.6
                ctx.stroke()
              }
            }
          })
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createLuxuryParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createLuxuryParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [isVisible, prefersReducedMotion, isLowPerformance])

  if (prefersReducedMotion || isLowPerformance) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
      aria-hidden="true"
    />
  )
}
