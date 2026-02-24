"use client"

import { useEffect, useRef, useState } from "react"
import { AdaptivePerformanceEngine } from "./adaptive-performance-engine"
import { AdvancedMemoryManager } from "./advanced-memory-manager"

interface WebGLOptimizationConfig {
  enableInstancing: boolean
  enableCulling: boolean
  enableLOD: boolean
  maxDrawCalls: number
  texturePoolSize: number
  bufferPoolSize: number
}

class WebGLOptimizationEngine {
  private gl: WebGLRenderingContext
  private performanceEngine: AdaptivePerformanceEngine
  private memoryManager: AdvancedMemoryManager
  private config: WebGLOptimizationConfig
  private shaderCache: Map<string, WebGLProgram> = new Map()
  private bufferPool: WebGLBuffer[] = []
  private texturePool: WebGLTexture[] = []
  private drawCallCount = 0
  private frameStats = {
    drawCalls: 0,
    triangles: 0,
    shaderSwitches: 0,
    bufferBinds: 0,
  }

  constructor(
    gl: WebGLRenderingContext,
    performanceEngine: AdaptivePerformanceEngine,
    memoryManager: AdvancedMemoryManager,
  ) {
    this.gl = gl
    this.performanceEngine = performanceEngine
    this.memoryManager = memoryManager

    this.config = this.determineOptimalConfig()
    this.initializeOptimizations()

    console.log("[v0] WebGL Optimization Engine initialized with config:", this.config)
  }

  private determineOptimalConfig(): WebGLOptimizationConfig {
    const performanceLevel = this.performanceEngine.getCurrentLevel()

    // Base configuration on performance level
    switch (performanceLevel.animationQuality) {
      case "low":
        return {
          enableInstancing: false,
          enableCulling: true,
          enableLOD: true,
          maxDrawCalls: 50,
          texturePoolSize: 10,
          bufferPoolSize: 20,
        }
      case "medium":
        return {
          enableInstancing: true,
          enableCulling: true,
          enableLOD: true,
          maxDrawCalls: 100,
          texturePoolSize: 20,
          bufferPoolSize: 40,
        }
      case "high":
        return {
          enableInstancing: true,
          enableCulling: true,
          enableLOD: false,
          maxDrawCalls: 200,
          texturePoolSize: 40,
          bufferPoolSize: 80,
        }
      case "ultra":
        return {
          enableInstancing: true,
          enableCulling: false,
          enableLOD: false,
          maxDrawCalls: 500,
          texturePoolSize: 80,
          bufferPoolSize: 160,
        }
      default:
        return {
          enableInstancing: true,
          enableCulling: true,
          enableLOD: true,
          maxDrawCalls: 100,
          texturePoolSize: 20,
          bufferPoolSize: 40,
        }
    }
  }

  private initializeOptimizations() {
    this.setupWebGLState()
    this.initializeResourcePools()
    this.registerPerformanceCallbacks()
  }

  private setupWebGLState() {
    const gl = this.gl

    // Enable depth testing and blending
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Enable culling if configured
    if (this.config.enableCulling) {
      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.BACK)
    }

    // Set clear color
    gl.clearColor(0.03, 0.05, 0.15, 0.0)

    // Enable extensions for better performance
    const extensions = [
      "OES_vertex_array_object",
      "WEBGL_lose_context",
      "OES_element_index_uint",
      "ANGLE_instanced_arrays",
    ]

    extensions.forEach((ext) => {
      const extension = gl.getExtension(ext)
      if (extension) {
        console.log(`[v0] WebGL extension enabled: ${ext}`)
      }
    })
  }

  private initializeResourcePools() {
    // Buffer pool
    for (let i = 0; i < this.config.bufferPoolSize; i++) {
      const buffer = this.gl.createBuffer()
      if (buffer) {
        this.bufferPool.push(buffer)
      }
    }

    // Texture pool
    for (let i = 0; i < this.config.texturePoolSize; i++) {
      const texture = this.gl.createTexture()
      if (texture) {
        this.texturePool.push(texture)
      }
    }

    console.log(
      `[v0] Resource pools initialized: ${this.bufferPool.length} buffers, ${this.texturePool.length} textures`,
    )
  }

  private registerPerformanceCallbacks() {
    // Register with performance engine for adaptive optimization
    this.performanceEngine.registerPerformanceCallback((level) => {
      this.adaptToPerformanceLevel(level)
    })

    // Register cleanup with memory manager
    this.memoryManager.registerCleanupCallback(() => {
      this.performResourceCleanup()
    })
  }

  private adaptToPerformanceLevel(level: any) {
    const newConfig = this.determineOptimalConfig()

    // Update configuration if it changed
    if (JSON.stringify(newConfig) !== JSON.stringify(this.config)) {
      console.log("[v0] Adapting WebGL optimization config:", newConfig)
      this.config = newConfig

      // Adjust culling
      if (this.config.enableCulling) {
        this.gl.enable(this.gl.CULL_FACE)
      } else {
        this.gl.disable(this.gl.CULL_FACE)
      }

      // Resize resource pools if needed
      this.adjustResourcePools()
    }
  }

  private adjustResourcePools() {
    // Adjust buffer pool size
    while (this.bufferPool.length < this.config.bufferPoolSize) {
      const buffer = this.gl.createBuffer()
      if (buffer) {
        this.bufferPool.push(buffer)
      }
    }

    // Adjust texture pool size
    while (this.texturePool.length < this.config.texturePoolSize) {
      const texture = this.gl.createTexture()
      if (texture) {
        this.texturePool.push(texture)
      }
    }
  }

  private performResourceCleanup() {
    console.log("[v0] Performing WebGL resource cleanup")

    // Clear shader cache
    this.shaderCache.forEach((program) => {
      this.gl.deleteProgram(program)
    })
    this.shaderCache.clear()

    // Reduce resource pools by 50%
    const targetBuffers = Math.floor(this.bufferPool.length * 0.5)
    while (this.bufferPool.length > targetBuffers) {
      const buffer = this.bufferPool.pop()
      if (buffer) {
        this.gl.deleteBuffer(buffer)
      }
    }

    const targetTextures = Math.floor(this.texturePool.length * 0.5)
    while (this.texturePool.length > targetTextures) {
      const texture = this.texturePool.pop()
      if (texture) {
        this.gl.deleteTexture(texture)
      }
    }

    // Force WebGL context cleanup
    const loseContext = this.gl.getExtension("WEBGL_lose_context")
    if (loseContext) {
      setTimeout(() => {
        loseContext.restoreContext()
      }, 100)
    }
  }

  public createOptimizedShader(vertexSource: string, fragmentSource: string, name: string): WebGLProgram | null {
    // Check cache first
    if (this.shaderCache.has(name)) {
      return this.shaderCache.get(name)!
    }

    const gl = this.gl

    // Create and compile vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertexShader) return null

    gl.shaderSource(vertexShader, vertexSource)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("[v0] Vertex shader compilation error:", gl.getShaderInfoLog(vertexShader))
      gl.deleteShader(vertexShader)
      return null
    }

    // Create and compile fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragmentShader) {
      gl.deleteShader(vertexShader)
      return null
    }

    gl.shaderSource(fragmentShader, fragmentSource)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error("[v0] Fragment shader compilation error:", gl.getShaderInfoLog(fragmentShader))
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return null
    }

    // Create and link program
    const program = gl.createProgram()
    if (!program) {
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return null
    }

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[v0] Program linking error:", gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return null
    }

    // Cache the program
    this.shaderCache.set(name, program)

    // Clean up shaders (they're now part of the program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    console.log(`[v0] Optimized shader created and cached: ${name}`)
    return program
  }

  public getBufferFromPool(): WebGLBuffer | null {
    if (this.bufferPool.length > 0) {
      return this.bufferPool.pop()!
    }

    // Pool exhausted, create new buffer
    const buffer = this.gl.createBuffer()
    console.warn("[v0] Buffer pool exhausted, creating new buffer")
    return buffer
  }

  public returnBufferToPool(buffer: WebGLBuffer) {
    if (this.bufferPool.length < this.config.bufferPoolSize) {
      this.bufferPool.push(buffer)
    } else {
      // Pool is full, delete the buffer
      this.gl.deleteBuffer(buffer)
    }
  }

  public getTextureFromPool(): WebGLTexture | null {
    if (this.texturePool.length > 0) {
      return this.texturePool.pop()!
    }

    // Pool exhausted, create new texture
    const texture = this.gl.createTexture()
    console.warn("[v0] Texture pool exhausted, creating new texture")
    return texture
  }

  public returnTextureToPool(texture: WebGLTexture) {
    if (this.texturePool.length < this.config.texturePoolSize) {
      this.texturePool.push(texture)
    } else {
      // Pool is full, delete the texture
      this.gl.deleteTexture(texture)
    }
  }

  public beginFrame() {
    this.drawCallCount = 0
    this.frameStats = {
      drawCalls: 0,
      triangles: 0,
      shaderSwitches: 0,
      bufferBinds: 0,
    }
  }

  public trackDrawCall(triangleCount = 0) {
    this.drawCallCount++
    this.frameStats.drawCalls++
    this.frameStats.triangles += triangleCount

    if (this.drawCallCount > this.config.maxDrawCalls) {
      console.warn(`[v0] Draw call limit exceeded: ${this.drawCallCount}/${this.config.maxDrawCalls}`)
    }
  }

  public trackShaderSwitch() {
    this.frameStats.shaderSwitches++
  }

  public trackBufferBind() {
    this.frameStats.bufferBinds++
  }

  public getFrameStats() {
    return { ...this.frameStats }
  }

  public getConfig() {
    return { ...this.config }
  }

  public destroy() {
    console.log("[v0] Destroying WebGL Optimization Engine")

    // Clean up shader cache
    this.shaderCache.forEach((program) => {
      this.gl.deleteProgram(program)
    })
    this.shaderCache.clear()

    // Clean up buffer pool
    this.bufferPool.forEach((buffer) => {
      this.gl.deleteBuffer(buffer)
    })
    this.bufferPool = []

    // Clean up texture pool
    this.texturePool.forEach((texture) => {
      this.gl.deleteTexture(texture)
    })
    this.texturePool = []
  }
}

export default function WebGLOptimizationEngineComponent() {
  const engineRef = useRef<WebGLOptimizationEngine | null>(null)
  const [stats, setStats] = useState({
    drawCalls: 0,
    triangles: 0,
    shaderSwitches: 0,
    bufferBinds: 0,
  })
  const [config, setConfig] = useState<WebGLOptimizationConfig | null>(null)

  useEffect(() => {
    // This is a service component that will be used by other WebGL components
    // It doesn't render anything itself but provides optimization services

    const performanceEngine = AdaptivePerformanceEngine.getInstance()
    const memoryManager = AdvancedMemoryManager.getInstance()

    // Create a dummy canvas to get WebGL context for the optimization engine
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl")

    if (gl) {
      engineRef.current = new WebGLOptimizationEngine(gl, performanceEngine, memoryManager)
      setConfig(engineRef.current.getConfig())

      // Update stats periodically
      const statsInterval = setInterval(() => {
        if (engineRef.current) {
          setStats(engineRef.current.getFrameStats())
        }
      }, 1000)

      return () => {
        clearInterval(statsInterval)
        if (engineRef.current) {
          engineRef.current.destroy()
        }
      }
    }
  }, [])

  return null // Service component with no UI
}

export { WebGLOptimizationEngine }
