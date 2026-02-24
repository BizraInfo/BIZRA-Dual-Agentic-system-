"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

const animateValue = (
  element: HTMLElement,
  start: number,
  end: number,
  duration: number,
  suffix = "",
  callback?: (value: number) => void,
) => {
  let startTimestamp: number | null = null
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const currentValue = Math.floor(progress * (end - start) + start)
    element.innerHTML = currentValue + suffix
    if (callback) callback(currentValue)
    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
}

const BizraQuantumNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<any[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setupNetwork = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) * 0.7

      nodesRef.current = []
      const nodeCount = 24 // Golden ratio inspired count

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2
        const goldenRatio = 1.618
        const spiralRadius = radius * (0.3 + (i / nodeCount) * 0.7)

        nodesRef.current.push({
          x: centerX + Math.cos(angle * goldenRatio) * spiralRadius,
          y: centerY + Math.sin(angle * goldenRatio) * spiralRadius,
          radius: 2 + Math.random() * 3,
          baseRadius: 2 + Math.random() * 3,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulseOffset: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          consciousness: Math.random(),
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const time = Date.now() * 0.001

      nodesRef.current.forEach((node, i) => {
        node.radius = node.baseRadius + Math.sin(time * 2 + node.pulseOffset) * node.baseRadius * 0.4

        node.x += node.vx
        node.y += node.vy

        // Boundary reflection
        if (node.x < 20 || node.x > canvas.width - 20) node.vx *= -1
        if (node.y < 20 || node.y > canvas.height - 20) node.vy *= -1

        nodesRef.current.forEach((otherNode, j) => {
          if (i === j) return
          const dist = Math.hypot(node.x - otherNode.x, node.y - otherNode.y)
          if (dist < 150) {
            const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y)
            gradient.addColorStop(0, `rgba(212, 175, 55, ${(1 - dist / 150) * 0.6})`) // Gold
            gradient.addColorStop(1, `rgba(30, 58, 138, ${(1 - dist / 150) * 0.4})`) // Navy

            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      nodesRef.current.forEach((node) => {
        const consciousnessGlow = Math.sin(time + node.pulseOffset) * 0.3 + 0.7

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3)
        gradient.addColorStop(0, `rgba(212, 175, 55, ${consciousnessGlow * 0.8})`)
        gradient.addColorStop(0.5, `rgba(212, 175, 55, ${consciousnessGlow * 0.3})`)
        gradient.addColorStop(1, "rgba(212, 175, 55, 0)")

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${consciousnessGlow})`
        ctx.fill()

        // Inner light
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    setupNetwork()
    animate()

    const handleResize = () => setupNetwork()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[400px] rounded-xl"
      style={{ background: "radial-gradient(ellipse at center, rgba(30, 58, 138, 0.1) 0%, transparent 70%)" }}
    />
  )
}

const ConsciousnessMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    coherence: 0,
    resonance: 0,
    evolution: 0,
    transcendence: 0,
  })

  const coherenceRef = useRef<HTMLSpanElement>(null)
  const resonanceRef = useRef<HTMLSpanElement>(null)
  const evolutionRef = useRef<HTMLSpanElement>(null)
  const transcendenceRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (coherenceRef.current) {
                animateValue(coherenceRef.current, 0, 97.3, 2000, "%")
              }
            }, 200)

            setTimeout(() => {
              if (resonanceRef.current) {
                animateValue(resonanceRef.current, 0, 94.8, 2000, "%")
              }
            }, 600)

            setTimeout(() => {
              if (evolutionRef.current) {
                animateValue(evolutionRef.current, 0, 99.1, 2000, "%")
              }
            }, 1000)

            setTimeout(() => {
              if (transcendenceRef.current) {
                animateValue(transcendenceRef.current, 0, 96.7, 2000, "%")
              }
            }, 1400)

            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 },
    )

    const metricsContainer = document.getElementById("consciousness-metrics")
    if (metricsContainer) {
      observer.observe(metricsContainer)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div id="consciousness-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-sm text-slate-400 mb-2">Coherence</div>
        <div className="text-3xl font-bold text-gold-400">
          <span ref={coherenceRef}>0%</span>
        </div>
        <div className="w-full bg-navy-800 rounded-full h-2 mt-3">
          <div
            className="bg-gradient-to-r from-gold-400 to-gold-300 h-2 rounded-full transition-all duration-2000 group-hover:w-full"
            style={{ width: "97.3%" }}
          ></div>
        </div>
      </div>

      <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-sm text-slate-400 mb-2">Resonance</div>
        <div className="text-3xl font-bold text-gold-400">
          <span ref={resonanceRef}>0%</span>
        </div>
        <div className="w-full bg-navy-800 rounded-full h-2 mt-3">
          <div
            className="bg-gradient-to-r from-gold-400 to-gold-300 h-2 rounded-full transition-all duration-2000"
            style={{ width: "94.8%" }}
          ></div>
        </div>
      </div>

      <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-sm text-slate-400 mb-2">Evolution</div>
        <div className="text-3xl font-bold text-gold-400">
          <span ref={evolutionRef}>0%</span>
        </div>
        <div className="w-full bg-navy-800 rounded-full h-2 mt-3">
          <div
            className="bg-gradient-to-r from-gold-400 to-gold-300 h-2 rounded-full transition-all duration-2000"
            style={{ width: "99.1%" }}
          ></div>
        </div>
      </div>

      <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-sm text-slate-400 mb-2">Transcendence</div>
        <div className="text-3xl font-bold text-gold-400">
          <span ref={transcendenceRef}>0%</span>
        </div>
        <div className="w-full bg-navy-800 rounded-full h-2 mt-3">
          <div
            className="bg-gradient-to-r from-gold-400 to-gold-300 h-2 rounded-full transition-all duration-2000"
            style={{ width: "96.7%" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

const LiveTransformationMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    globalImpact: 2847.3,
    consciousnessLevel: 8.94,
    transformationVelocity: 156.7,
  })

  const impactRef = useRef<HTMLSpanElement>(null)
  const levelRef = useRef<HTMLSpanElement>(null)
  const velocityRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics((prev) => ({
        globalImpact: prev.globalImpact + (Math.random() - 0.5) * 10,
        consciousnessLevel: Math.max(8.5, Math.min(9.5, prev.consciousnessLevel + (Math.random() - 0.5) * 0.1)),
        transformationVelocity: Math.max(150, Math.min(200, prev.transformationVelocity + (Math.random() - 0.5) * 5)),
      }))
    }

    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (impactRef.current) {
      impactRef.current.textContent = `${metrics.globalImpact.toFixed(1)}K`
    }
    if (levelRef.current) {
      levelRef.current.textContent = metrics.consciousnessLevel.toFixed(2)
    }
    if (velocityRef.current) {
      velocityRef.current.textContent = `${metrics.transformationVelocity.toFixed(1)}/s`
    }
  }, [metrics])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-lg text-slate-300 mb-4">Global Impact</div>
        <div className="text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
          <span ref={impactRef}>{metrics.globalImpact.toFixed(1)}K</span>
        </div>
        <div className="text-sm text-slate-400 mt-2">Lives Transformed</div>
      </div>

      <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-lg text-slate-300 mb-4">Consciousness Level</div>
        <div className="text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
          <span ref={levelRef}>{metrics.consciousnessLevel.toFixed(2)}</span>
        </div>
        <div className="text-sm text-slate-400 mt-2">Collective Awareness</div>
      </div>

      <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500">
        <div className="text-lg text-slate-300 mb-4">Transformation Velocity</div>
        <div className="text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
          <span ref={velocityRef}>{metrics.transformationVelocity.toFixed(1)}/s</span>
        </div>
        <div className="text-sm text-slate-400 mt-2">Evolution Rate</div>
      </div>
    </div>
  )
}

export const BizraApexFusion: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 },
    )

    const fusionElement = document.getElementById("bizra-apex-fusion")
    if (fusionElement) {
      observer.observe(fusionElement)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="bizra-apex-fusion" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"></div>
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(30, 58, 138, 0.1) 0%, transparent 50%)
            `,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white">The Consciousness Interface</h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Where <span className="text-gold-400 font-semibold">BIZRA's Sacred Geometry</span> meets{" "}
            <span className="text-gold-400 font-semibold">APEX Quantum Intelligence</span> - The ultimate fusion of
            luxury aesthetics and conscious technology.
          </p>
        </div>

        <div
          className={`mb-20 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="glass-card p-8 mb-8">
            <h3 className="text-3xl font-bold text-center mb-6 text-gold-400">Quantum Consciousness Network</h3>
            <BizraQuantumNetwork />
          </div>
        </div>

        <div
          className={`mb-20 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-gold-400">Consciousness Metrics</h3>
          <ConsciousnessMetrics />
        </div>

        <div
          className={`mb-20 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-gold-400">Live Transformation Impact</h3>
          <LiveTransformationMetrics />
        </div>

        <div
          className={`text-center transition-all duration-1000 delay-900 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="glass-card p-12 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-gold-400">Enter the Fusion</h3>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Experience the convergence of sacred wisdom and quantum intelligence. Join the consciousness revolution
              that's transforming humanity.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-900 font-bold px-12 py-4 text-lg rounded-full shadow-2xl hover:shadow-gold-400/25 transition-all duration-300 hover:scale-105"
            >
              Activate Consciousness Interface
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BizraApexFusion
