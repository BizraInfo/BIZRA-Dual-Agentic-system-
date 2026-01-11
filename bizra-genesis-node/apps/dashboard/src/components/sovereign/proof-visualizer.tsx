"use client"

import { useEffect, useRef, useState } from "react"
import { useProofEngine } from "@/hooks/use-proof-engine"
import { Eye, Sparkles } from "lucide-react"

export function ProofVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { proofs, metrics } = useProofEngine()
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear
    ctx.fillStyle = "rgba(8, 12, 24, 1)"
    ctx.fillRect(0, 0, rect.width, rect.height)

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Draw elliptic curve visualization (BN254)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.2)"
    ctx.lineWidth = 1

    // Draw curve points
    for (let i = 0; i < 360; i += 5) {
      const angle = (i + animationPhase) * (Math.PI / 180)
      const r = 80 + Math.sin(angle * 3) * 20
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r

      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + Math.sin(angle) * 0.3})`
      ctx.fill()
    }

    // Inner ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(52, 211, 153, 0.3)"
    ctx.stroke()

    // Proof generation indicator
    const latestProof = proofs[0]
    if (latestProof) {
      const progress = latestProof.status === "verified" ? 1 : latestProof.status === "pending" ? 0.5 : 0

      // Progress arc
      ctx.beginPath()
      ctx.arc(centerX, centerY, 100, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
      ctx.strokeStyle = latestProof.status === "verified" ? "rgb(52, 211, 153)" : "rgb(251, 191, 36)"
      ctx.lineWidth = 4
      ctx.stroke()

      // Status text
      ctx.fillStyle = latestProof.status === "verified" ? "rgb(52, 211, 153)" : "rgb(251, 191, 36)"
      ctx.font = 'bold 14px "Geist Mono", monospace'
      ctx.textAlign = "center"
      ctx.fillText(latestProof.status.toUpperCase(), centerX, centerY - 10)

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = '10px "Geist Mono", monospace'
      ctx.fillText(latestProof.circuitId, centerX, centerY + 10)
    }

    // Draw verification nodes
    const verifiedCount = proofs.filter((p) => p.status === "verified").length
    for (let i = 0; i < Math.min(verifiedCount, 12); i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const x = centerX + Math.cos(angle) * 130
      const y = centerY + Math.sin(angle) * 130

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(52, 211, 153, 0.8)"
      ctx.fill()

      // Connection line
      ctx.beginPath()
      ctx.moveTo(centerX + Math.cos(angle) * 100, centerY + Math.sin(angle) * 100)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "rgba(52, 211, 153, 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [proofs, animationPhase])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Proof Visualizer</h2>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-accent animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground">BN254 Curve</span>
        </div>
      </div>

      {/* Visualization */}
      <div ref={containerRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 border-t border-border bg-card/50">
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-foreground">{metrics?.totalProofs ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Generated</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-accent">{metrics?.verifiedProofs ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Verified</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-foreground">{metrics?.avgGenerationTimeMs ?? 0}ms</div>
          <div className="font-mono text-[10px] text-muted-foreground">Avg Gen</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-foreground">{metrics?.avgVerificationTimeMs ?? 0}ms</div>
          <div className="font-mono text-[10px] text-muted-foreground">Avg Verify</div>
        </div>
      </div>
    </div>
  )
}
