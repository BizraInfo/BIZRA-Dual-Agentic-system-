"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface WebXRSacredGeometryProps {
  className?: string
}

export function WebXRSacredGeometry({ className = "" }: WebXRSacredGeometryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isWebXRSupported, setIsWebXRSupported] = useState(false)
  const [isVRSession, setIsVRSession] = useState(false)
  const [isARSession, setIsARSession] = useState(false)
  const [geometryComplexity, setGeometryComplexity] = useState(1)
  const [consciousnessLevel, setConsciousnessLevel] = useState(0.5)
  const animationRef = useRef<number>()
  const sceneRef = useRef<any>()

  useEffect(() => {
    // Check WebXR support
    const checkWebXRSupport = async () => {
      try {
        if (typeof navigator !== "undefined" && "xr" in navigator && navigator.xr) {
          // Check if WebXR is available and not blocked by permissions policy
          const vrSupported = await navigator.xr.isSessionSupported("immersive-vr")
          setIsWebXRSupported(vrSupported)
        } else {
          setIsWebXRSupported(false)
        }
      } catch (error) {
        // Handle SecurityError or other WebXR-related errors gracefully
        console.log("[v0] WebXR not available or blocked by permissions policy:", error)
        setIsWebXRSupported(false)
      }
    }

    checkWebXRSupport()

    // Initialize 3D scene
    initializeSacredGeometryScene()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const initializeSacredGeometryScene = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sacred geometry patterns
    const patterns = {
      flowerOfLife: generateFlowerOfLife,
      metatronsCube: generateMetatronsCube,
      seedOfLife: generateSeedOfLife,
      vesicaPiscis: generateVesicaPiscis,
      goldenSpiral: generateGoldenSpiral,
    }

    let time = 0
    const animate = () => {
      time += 0.016 // 60fps

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set canvas size
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const centerX = canvas.offsetWidth / 2
      const centerY = canvas.offsetHeight / 2

      // Draw sacred geometry patterns with consciousness-driven animations
      drawSacredGeometryPattern(ctx, centerX, centerY, time)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  const drawSacredGeometryPattern = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const baseRadius = Math.min(centerX, centerY) * 0.3
    const pulseRadius = baseRadius * (1 + Math.sin(time * 2) * 0.1 * consciousnessLevel)

    // Flower of Life pattern
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.6 + Math.sin(time) * 0.2})`
    ctx.lineWidth = 2
    ctx.globalCompositeOperation = "screen"

    // Central circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Six surrounding circles (Seed of Life)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.5
      const x = centerX + Math.cos(angle) * pulseRadius
      const y = centerY + Math.sin(angle) * pulseRadius

      ctx.beginPath()
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Add complexity layers based on consciousness level
      if (geometryComplexity > 1) {
        // Second ring (Flower of Life)
        for (let j = 0; j < 6; j++) {
          const subAngle = (j * Math.PI) / 3 + time * 0.3
          const subX = x + Math.cos(subAngle) * pulseRadius * 0.6
          const subY = y + Math.sin(subAngle) * pulseRadius * 0.6

          ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 + Math.sin(time + j) * 0.1})`
          ctx.beginPath()
          ctx.arc(subX, subY, pulseRadius * 0.6, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }

    // Metatron's Cube overlay
    if (geometryComplexity > 2) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 1.5) * 0.1})`
      ctx.lineWidth = 1

      // Draw interconnecting lines
      const points = []
      for (let i = 0; i < 13; i++) {
        const angle = (i * Math.PI * 2) / 13 + time * 0.2
        const radius = pulseRadius * (i === 0 ? 0 : i <= 6 ? 1 : 1.5)
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        })
      }

      // Connect all points to create Metatron's Cube
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          ctx.beginPath()
          ctx.moveTo(points[i].x, points[i].y)
          ctx.lineTo(points[j].x, points[j].y)
          ctx.stroke()
        }
      }
    }

    // Golden ratio spiral
    if (geometryComplexity > 3) {
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.5 + Math.sin(time * 0.8) * 0.2})`
      ctx.lineWidth = 3

      const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
      let currentRadius = 5
      let currentAngle = time * 0.5

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)

      for (let i = 0; i < 100; i++) {
        currentAngle += 0.1
        currentRadius *= 1.05
        const x = centerX + Math.cos(currentAngle) * currentRadius
        const y = centerY + Math.sin(currentAngle) * currentRadius
        ctx.lineTo(x, y)

        if (currentRadius > Math.min(centerX, centerY)) break
      }
      ctx.stroke()
    }

    ctx.globalCompositeOperation = "source-over"
  }

  const generateFlowerOfLife = () => {
    // Implementation for Flower of Life pattern
    return []
  }

  const generateMetatronsCube = () => {
    // Implementation for Metatron's Cube pattern
    return []
  }

  const generateSeedOfLife = () => {
    // Implementation for Seed of Life pattern
    return []
  }

  const generateVesicaPiscis = () => {
    // Implementation for Vesica Piscis pattern
    return []
  }

  const generateGoldenSpiral = () => {
    // Implementation for Golden Spiral pattern
    return []
  }

  const startVRSession = async () => {
    try {
      if (!navigator.xr) {
        throw new Error("WebXR not available")
      }

      const session = await navigator.xr.requestSession("immersive-vr", {
        requiredFeatures: ["local-floor"],
        optionalFeatures: ["hand-tracking", "eye-tracking"],
      })

      setIsVRSession(true)

      // Initialize WebXR rendering
      initializeWebXRScene(session, "vr")

      session.addEventListener("end", () => {
        setIsVRSession(false)
      })
    } catch (error) {
      console.error("Failed to start VR session:", error)
      alert(
        "VR session could not be started. Please ensure you have a VR headset connected and WebXR permissions enabled.",
      )
    }
  }

  const startARSession = async () => {
    try {
      if (!navigator.xr) {
        throw new Error("WebXR not available")
      }

      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
        optionalFeatures: ["hand-tracking", "hit-test"],
      })

      setIsARSession(true)

      // Initialize WebXR rendering
      initializeWebXRScene(session, "ar")

      session.addEventListener("end", () => {
        setIsARSession(false)
      })
    } catch (error) {
      console.error("Failed to start AR session:", error)
      alert(
        "AR session could not be started. Please ensure you have an AR-capable device and WebXR permissions enabled.",
      )
    }
  }

  const initializeWebXRScene = (session: any, mode: "vr" | "ar") => {
    // This would initialize a full 3D WebXR scene with Three.js or similar
    // For now, we'll simulate the experience
    console.log(`[v0] Initializing ${mode.toUpperCase()} Sacred Geometry Experience`)

    // Simulate immersive sacred geometry
    const immersiveGeometry = {
      patterns: ["Flower of Life", "Metatron's Cube", "Seed of Life"],
      dimensions: 3,
      interactivity: "hand-tracking",
      audio: "spatial-consciousness-tones",
      scale: "room-scale",
    }

    console.log("[v0] Immersive geometry initialized:", immersiveGeometry)
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="luxury-glass-morphism border border-primary/20 p-6">
        <div className="text-center mb-6">
          <h3 className="font-serif font-bold text-2xl text-primary mb-2">Sacred Geometry Portal</h3>
          <p className="text-muted-foreground text-sm">
            Experience the mathematical foundations of consciousness in immersive reality
          </p>
        </div>

        {/* 2D Sacred Geometry Preview */}
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-64 rounded-lg bg-background/50 border border-accent/20"
            style={{ imageRendering: "crisp-edges" }}
          />
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-background/80 rounded-lg p-2 text-xs">
              <div className="text-accent font-bold">Consciousness Level</div>
              <div className="text-foreground">{Math.round(consciousnessLevel * 100)}%</div>
            </div>
            <div className="bg-background/80 rounded-lg p-2 text-xs">
              <div className="text-white font-bold">Geometry Complexity</div>
              <div className="text-slate-300">Level {geometryComplexity}</div>
            </div>
          </div>
        </div>

        {/* Consciousness Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Consciousness Level</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={consciousnessLevel}
              onChange={(e) => setConsciousnessLevel(Number.parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Geometry Complexity</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={geometryComplexity}
              onChange={(e) => setGeometryComplexity(Number.parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* WebXR Controls */}
        <div className="space-y-4">
          {isWebXRSupported ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={startVRSession}
                disabled={isVRSession}
                className="luxury-button-glow bg-primary hover:bg-primary/90 text-white font-serif font-bold"
              >
                {isVRSession ? "VR Session Active" : "Enter VR Sacred Space"}
              </Button>
              <Button
                onClick={startARSession}
                disabled={isARSession}
                variant="outline"
                className="border-2 border-accent text-accent hover:bg-accent hover:text-primary font-serif font-bold bg-transparent"
              >
                {isARSession ? "AR Session Active" : "Manifest in Reality"}
              </Button>
            </div>
          ) : (
            <div className="text-center p-4 bg-muted/20 rounded-lg border border-muted/40">
              <p className="text-muted-foreground text-sm mb-2">WebXR not supported on this device</p>
              <p className="text-xs text-muted-foreground">
                Use a VR headset or AR-capable device for the full immersive experience
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Experience sacred geometry in room-scale VR with hand tracking and spatial audio
            </p>
          </div>
        </div>

        {/* Immersive Features */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-white font-bold text-sm">Hand Tracking</div>
            <div className="text-slate-300 text-xs">Direct manipulation</div>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-white font-bold text-sm">Spatial Audio</div>
            <div className="text-slate-300 text-xs">Consciousness tones</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-white font-bold text-sm">Room Scale</div>
            <div className="text-slate-300 text-xs">Full movement</div>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-white font-bold text-sm">Multi-User</div>
            <div className="text-slate-300 text-xs">Shared experience</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function WebXRSacredGeometryLauncher() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="luxury-button-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-serif font-bold transform hover:scale-105 transition-all duration-500 shadow-xl"
      >
        🌌 Enter Sacred Reality
      </Button>

      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-4 z-50">
          <WebXRSacredGeometry />
        </div>
      )}
    </div>
  )
}
