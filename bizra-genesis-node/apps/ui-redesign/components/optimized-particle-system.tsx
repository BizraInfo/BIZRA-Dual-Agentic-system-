"use client"

import type React from "react"

import { useEffect, useRef, useCallback, useState } from "react"
import { AdaptivePerformanceEngine } from "./adaptive-performance-engine"
import { AdvancedMemoryManager } from "./advanced-memory-manager"

interface OptimizedParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  life: number
  active: boolean
}

interface PerformanceLevel {
  particles: number
  animationQuality: "low" | "medium" | "high" | "ultra"
  webglEnabled: boolean
  shadowsEnabled: boolean
  postProcessing: boolean
}

class OptimizedParticleRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: OptimizedParticle[] = []
  private particlePool: OptimizedParticle[] = []
  private activeParticles = 0
  private maxParticles = 100
  private animationId: number | null = null
  private lastFrameTime = 0
  private frameCount = 0
  private spatialGrid: Map<string, OptimizedParticle[]> = new Map()
  private gridSize = 100
  private performanceEngine: AdaptivePerformanceEngine
  private memoryManager: AdvancedMemoryManager
  private isDestroyed = false

  constructor(
    canvas: HTMLCanvasElement,
    performanceEngine: AdaptivePerformanceEngine,
    memoryManager: AdvancedMemoryManager,
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.performanceEngine = performanceEngine
    this.memoryManager = memoryManager

    this.initializeParticlePool()
    this.setupPerformanceCallbacks()

    console.log("[v0] Optimized Particle Renderer initialized")
  }

  private initializeParticlePool() {
    // Pre-allocate particle objects to avoid garbage collection
    for (let i = 0; i < 500; i++) {
      this.particlePool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        opacity: 0,
        hue: 0,
        life: 0,
        active: false,
      })
    }
  }

  private setupPerformanceCallbacks() {
    // Register with performance engine for adaptive quality
    this.performanceEngine.registerPerformanceCallback((level: PerformanceLevel) => {
      this.maxParticles = level.particles
      this.adjustQuality(level.animationQuality)
      console.log(`[v0] Particle system adapted to ${level.animationQuality} quality, ${level.particles} max particles`)
    })

    // Register cleanup callback with memory manager
    this.memoryManager.registerCleanupCallback(() => {
      this.performCleanup()
    })
  }

  private adjustQuality(quality: "low" | "medium" | "high" | "ultra") {
    switch (quality) {
      case "low":
        this.maxParticles = Math.min(this.maxParticles, 50)
        this.gridSize = 150 // Larger grid cells = fewer calculations
        break
      case "medium":
        this.maxParticles = Math.min(this.maxParticles, 100)
        this.gridSize = 120
        break
      case "high":
        this.maxParticles = Math.min(this.maxParticles, 200)
        this.gridSize = 100
        break
      case "ultra":
        this.maxParticles = Math.min(this.maxParticles, 300)
        this.gridSize = 80
        break
    }
  }

  private performCleanup() {
    console.log("[v0] Performing particle system cleanup")

    // Reduce active particles by 50%
    const targetCount = Math.floor(this.activeParticles * 0.5)
    while (this.activeParticles > targetCount) {
      this.deactivateOldestParticle()
    }

    // Clear spatial grid
    this.spatialGrid.clear()

    // Force garbage collection hint
    if (typeof (window as any).gc === "function") {
      ;(window as any).gc()
    }
  }

  private deactivateOldestParticle() {
    let oldestIndex = -1
    let oldestLife = Number.POSITIVE_INFINITY

    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].active && this.particles[i].life < oldestLife) {
        oldestLife = this.particles[i].life
        oldestIndex = i
      }
    }

    if (oldestIndex >= 0) {
      this.recycleParticle(oldestIndex)
    }
  }

  private getGridKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.gridSize)
    const gridY = Math.floor(y / this.gridSize)
    return `${gridX},${gridY}`
  }

  private updateSpatialGrid() {
    this.spatialGrid.clear()

    for (const particle of this.particles) {
      if (!particle.active) continue

      const key = this.getGridKey(particle.x, particle.y)
      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, [])
      }
      this.spatialGrid.get(key)!.push(particle)
    }
  }

  private createParticle(x?: number, y?: number): OptimizedParticle | null {
    if (this.activeParticles >= this.maxParticles) return null

    // Get particle from pool
    let particle = this.particlePool.find((p) => !p.active)
    if (!particle) {
      // Pool exhausted, create new one (should rarely happen)
      particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        opacity: 0,
        hue: 0,
        life: 0,
        active: false,
      }
      this.particlePool.push(particle)
    }

    // Initialize particle
    particle.x = x ?? Math.random() * this.canvas.width
    particle.y = y ?? Math.random() * this.canvas.height
    particle.vx = (Math.random() - 0.5) * 0.5
    particle.vy = (Math.random() - 0.5) * 0.5
    particle.size = Math.random() * 3 + 1
    particle.opacity = Math.random() * 0.5 + 0.2
    particle.hue = Math.random() * 60 + 15
    particle.life = 1.0
    particle.active = true

    this.particles.push(particle)
    this.activeParticles++

    return particle
  }

  private recycleParticle(index: number) {
    const particle = this.particles[index]
    if (particle) {
      particle.active = false
      this.particles.splice(index, 1)
      this.activeParticles--
    }
  }

  private updateParticles(deltaTime: number) {
    const currentTime = performance.now()

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      if (!particle.active) continue

      // Update physics
      particle.x += particle.vx * deltaTime
      particle.y += particle.vy * deltaTime

      // Boundary wrapping
      if (particle.x < 0) particle.x = this.canvas.width
      if (particle.x > this.canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = this.canvas.height
      if (particle.y > this.canvas.height) particle.y = 0

      // Update life and opacity
      particle.life -= deltaTime * 0.0005
      particle.opacity = 0.3 + Math.sin(currentTime * 0.001 + i) * 0.2

      // Remove dead particles
      if (particle.life <= 0) {
        this.recycleParticle(i)
      }
    }
  }

  private renderParticles() {
    this.ctx.save()

    // Batch similar operations
    const particlesBySize = new Map<number, OptimizedParticle[]>()

    for (const particle of this.particles) {
      if (!particle.active) continue

      const sizeKey = Math.round(particle.size)
      if (!particlesBySize.has(sizeKey)) {
        particlesBySize.set(sizeKey, [])
      }
      particlesBySize.get(sizeKey)!.push(particle)
    }

    // Render particles in batches by size
    for (const [size, particles] of particlesBySize) {
      this.ctx.beginPath()

      for (const particle of particles) {
        this.ctx.moveTo(particle.x + size, particle.y)
        this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      }

      // Use a representative particle for styling
      if (particles.length > 0) {
        const representative = particles[0]
        this.ctx.fillStyle = `hsla(${representative.hue}, 70%, 60%, ${representative.opacity})`
        this.ctx.fill()
      }
    }

    this.ctx.restore()
  }

  private renderConnections() {
    this.ctx.save()
    this.ctx.lineWidth = 0.5

    for (const [key, particles] of this.spatialGrid) {
      if (particles.length < 2) continue

      // Get neighboring grid cells
      const [gridX, gridY] = key.split(",").map(Number)
      const neighborKeys = [
        `${gridX},${gridY}`,
        `${gridX + 1},${gridY}`,
        `${gridX},${gridY + 1}`,
        `${gridX + 1},${gridY + 1}`,
      ]

      const nearbyParticles: OptimizedParticle[] = []
      for (const neighborKey of neighborKeys) {
        const neighbors = this.spatialGrid.get(neighborKey)
        if (neighbors) {
          nearbyParticles.push(...neighbors)
        }
      }

      // Draw connections within reasonable distance
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]

        for (let j = i + 1; j < nearbyParticles.length; j++) {
          const other = nearbyParticles[j]
          if (particle === other) continue

          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            this.ctx.beginPath()
            this.ctx.moveTo(particle.x, particle.y)
            this.ctx.lineTo(other.x, other.y)
            this.ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${0.1 * (1 - distance / 100)})`
            this.ctx.stroke()
          }
        }
      }
    }

    this.ctx.restore()
  }

  public render() {
    if (this.isDestroyed) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime
    this.lastFrameTime = currentTime

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Update particles
    this.updateParticles(deltaTime)

    // Update spatial grid every few frames for performance
    if (this.frameCount % 3 === 0) {
      this.updateSpatialGrid()
    }

    // Render
    this.renderParticles()
    this.renderConnections()

    // Create new particles occasionally
    if (Math.random() > 0.98 && this.activeParticles < this.maxParticles) {
      this.createParticle()
    }

    this.frameCount++

    // Continue animation
    this.animationId = requestAnimationFrame(() => this.render())
  }

  public resize() {
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight

    // Recreate some particles for the new size
    const targetCount = Math.min(this.maxParticles, Math.floor((this.canvas.width * this.canvas.height) / 15000))
    while (this.activeParticles < targetCount) {
      this.createParticle()
    }
  }

  public addParticles(x: number, y: number, count = 5) {
    for (let i = 0; i < count && this.activeParticles < this.maxParticles; i++) {
      this.createParticle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20)
    }
  }

  public destroy() {
    console.log("[v0] Destroying optimized particle renderer")
    this.isDestroyed = true

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // Clear all particles
    this.particles = []
    this.particlePool = []
    this.spatialGrid.clear()
    this.activeParticles = 0
  }

  public getStats() {
    return {
      activeParticles: this.activeParticles,
      maxParticles: this.maxParticles,
      poolSize: this.particlePool.length,
      gridCells: this.spatialGrid.size,
    }
  }
}

export default function OptimizedParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<OptimizedParticleRenderer | null>(null)
  const performanceEngineRef = useRef<AdaptivePerformanceEngine | null>(null)
  const memoryManagerRef = useRef<AdvancedMemoryManager | null>(null)
  const [stats, setStats] = useState({ activeParticles: 0, maxParticles: 0, poolSize: 0, gridCells: 0 })

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    rendererRef.current.addParticles(x, y, 10)
    console.log(`[v0] Added particles at (${x}, ${y})`)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize performance systems
    performanceEngineRef.current = AdaptivePerformanceEngine.getInstance()
    memoryManagerRef.current = AdvancedMemoryManager.getInstance()

    // Initialize renderer
    rendererRef.current = new OptimizedParticleRenderer(canvas, performanceEngineRef.current, memoryManagerRef.current)

    // Setup canvas
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.resize()
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Start rendering
    rendererRef.current.render()

    // Update stats periodically
    const statsInterval = setInterval(() => {
      if (rendererRef.current) {
        setStats(rendererRef.current.getStats())
      }
    }, 1000)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(statsInterval)

      if (rendererRef.current) {
        rendererRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-auto z-0 cursor-pointer"
        style={{ background: "transparent" }}
        onClick={handleCanvasClick}
      />

      {/* Performance stats overlay */}
      <div className="fixed top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1 z-10">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Active:</span>
          <span className="text-accent">{stats.activeParticles}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Max:</span>
          <span className="text-primary">{stats.maxParticles}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Pool:</span>
          <span className="text-muted-foreground">{stats.poolSize}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Grid:</span>
          <span className="text-muted-foreground">{stats.gridCells}</span>
        </div>
      </div>
    </div>
  )
}

export { OptimizedParticleRenderer }
