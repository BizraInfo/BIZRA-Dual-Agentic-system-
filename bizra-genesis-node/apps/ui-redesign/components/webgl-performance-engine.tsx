"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Card } from "@/components/ui/card"

// Advanced WebGL Performance Engine with Sacred Geometry
interface WebGLPerformanceEngineProps {
  className?: string
  enableParticles?: boolean
  enableSacredGeometry?: boolean
  quality?: "low" | "medium" | "high" | "ultra"
}

// Performance monitoring and optimization
class PerformanceOptimizer {
  private frameCount = 0
  private lastTime = 0
  private fps = 60
  private memoryUsage = 0
  private adaptiveQuality = "high"

  updateMetrics(currentTime: number) {
    this.frameCount++
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastTime = currentTime

      // Monitor memory usage
      if ((performance as any).memory) {
        this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024
      }

      // Adaptive quality based on performance
      if (this.fps < 30 || this.memoryUsage > 300) {
        this.adaptiveQuality = "low"
      } else if (this.fps < 45 || this.memoryUsage > 200) {
        this.adaptiveQuality = "medium"
      } else if (this.fps >= 60 && this.memoryUsage < 150) {
        this.adaptiveQuality = "ultra"
      } else {
        this.adaptiveQuality = "high"
      }

      console.log(
        `[v0] Performance: ${this.fps}fps, ${this.memoryUsage.toFixed(1)}MB, Quality: ${this.adaptiveQuality}`,
      )
    }
  }

  getQuality() {
    return this.adaptiveQuality
  }

  getFPS() {
    return this.fps
  }

  getMemoryUsage() {
    return this.memoryUsage
  }
}

// Advanced WebGL Shader Manager
class ShaderManager {
  private gl: WebGLRenderingContext
  private programs: Map<string, WebGLProgram> = new Map()

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
  }

  createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type)
    if (!shader) return null

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }

    return shader
  }

  createProgram(vertexSource: string, fragmentSource: string, name: string): WebGLProgram | null {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)

    if (!vertexShader || !fragmentShader) return null

    const program = this.gl.createProgram()
    if (!program) return null

    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("Program linking error:", this.gl.getProgramInfoLog(program))
      this.gl.deleteProgram(program)
      return null
    }

    this.programs.set(name, program)
    return program
  }

  getProgram(name: string): WebGLProgram | undefined {
    return this.programs.get(name)
  }
}

// Sacred Geometry 3D Renderer
class SacredGeometry3D {
  private gl: WebGLRenderingContext
  private shaderManager: ShaderManager
  private geometryBuffer: WebGLBuffer | null = null
  private indexBuffer: WebGLBuffer | null = null
  private vertices: Float32Array
  private indices: Uint16Array

  constructor(gl: WebGLRenderingContext, shaderManager: ShaderManager) {
    this.gl = gl
    this.shaderManager = shaderManager
    this.vertices = new Float32Array([])
    this.indices = new Uint16Array([])
    this.initializeGeometry()
    this.createShaders()
  }

  private initializeGeometry() {
    // Create sacred geometry patterns (Flower of Life, Metatron's Cube, etc.)
    const vertices: number[] = []
    const indices: number[] = []

    // Flower of Life pattern
    const radius = 0.3
    const centerCount = 7
    const petalCount = 6

    for (let i = 0; i < centerCount; i++) {
      const angle = (i * Math.PI * 2) / centerCount
      const centerX = i === 0 ? 0 : Math.cos(angle) * radius
      const centerY = i === 0 ? 0 : Math.sin(angle) * radius

      // Create petals around each center
      for (let j = 0; j <= petalCount; j++) {
        const petalAngle = (j * Math.PI * 2) / petalCount
        const x = centerX + Math.cos(petalAngle) * radius * 0.5
        const y = centerY + Math.sin(petalAngle) * radius * 0.5
        const z = Math.sin(petalAngle * 3) * 0.1 // Add depth variation

        vertices.push(x, y, z)

        // Add color information (golden ratio colors)
        vertices.push(0.85, 0.65, 0.13) // Gold

        // Add texture coordinates
        vertices.push((x + 1) * 0.5, (y + 1) * 0.5)
      }
    }

    // Create indices for triangulation
    for (let i = 0; i < vertices.length / 8 - 2; i++) {
      indices.push(0, i + 1, i + 2)
    }

    this.vertices = new Float32Array(vertices)
    this.indices = new Uint16Array(indices)

    // Create buffers
    this.geometryBuffer = this.gl.createBuffer()
    this.indexBuffer = this.gl.createBuffer()

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometryBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW)

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW)
  }

  private createShaders() {
    const vertexShaderSource = `
      attribute vec3 a_position;
      attribute vec3 a_color;
      attribute vec2 a_texCoord;
      
      uniform mat4 u_modelViewMatrix;
      uniform mat4 u_projectionMatrix;
      uniform float u_time;
      
      varying vec3 v_color;
      varying vec2 v_texCoord;
      varying float v_depth;
      
      void main() {
        // Sacred geometry transformation
        vec3 pos = a_position;
        
        // Golden ratio spiral transformation
        float phi = 1.618033988749;
        float spiral = sin(u_time * 0.001 + length(pos.xy) * phi) * 0.1;
        pos.z += spiral;
        
        // Consciousness wave effect
        float wave = sin(u_time * 0.002 + pos.x * 10.0) * sin(u_time * 0.003 + pos.y * 10.0) * 0.05;
        pos.z += wave;
        
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(pos, 1.0);
        
        v_color = a_color;
        v_texCoord = a_texCoord;
        v_depth = gl_Position.z;
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 v_color;
      varying vec2 v_texCoord;
      varying float v_depth;
      
      uniform float u_time;
      uniform float u_alpha;
      
      void main() {
        // Sacred geometry glow effect
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_texCoord, center);
        
        // Golden ratio based glow
        float phi = 1.618033988749;
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, phi);
        
        // Time-based pulsing
        float pulse = sin(u_time * 0.003) * 0.3 + 0.7;
        
        // Depth-based alpha
        float depthAlpha = 1.0 - clamp(v_depth * 0.5, 0.0, 0.8);
        
        vec3 finalColor = v_color * glow * pulse;
        float finalAlpha = u_alpha * glow * depthAlpha;
        
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `

    this.shaderManager.createProgram(vertexShaderSource, fragmentShaderSource, "sacredGeometry")
  }

  render(
    gl: WebGLRenderingContext,
    shaderManager: ShaderManager,
    time: number,
    modelViewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    alpha = 0.8,
  ) {
    const program = shaderManager.getProgram("sacredGeometry")
    if (!program || !this.geometryBuffer || !this.indexBuffer) return

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, "a_position")
    const colorLocation = gl.getAttribLocation(program, "a_color")
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord")

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer)

    // Position attribute (3 floats)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 8 * 4, 0)

    // Color attribute (3 floats)
    gl.enableVertexAttribArray(colorLocation)
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 8 * 4, 3 * 4)

    // Texture coordinate attribute (2 floats)
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 8 * 4, 6 * 4)

    // Set uniforms
    const modelViewLocation = gl.getUniformLocation(program, "u_modelViewMatrix")
    const projectionLocation = gl.getUniformLocation(program, "u_projectionMatrix")
    const timeLocation = gl.getUniformLocation(program, "u_time")
    const alphaLocation = gl.getUniformLocation(program, "u_alpha")

    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix)
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix)
    gl.uniform1f(timeLocation, time)
    gl.uniform1f(alphaLocation, alpha)

    // Render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)
  }
}

// Advanced Particle System with Object Pooling
class ParticleSystem3D {
  private gl: WebGLRenderingContext
  private shaderManager: ShaderManager
  private particles: Float32Array
  private particleBuffer: WebGLBuffer | null = null
  private maxParticles: number
  private activeParticles = 0

  constructor(gl: WebGLRenderingContext, shaderManager: ShaderManager, maxParticles = 1000) {
    this.gl = gl
    this.shaderManager = shaderManager
    this.maxParticles = maxParticles
    this.particles = new Float32Array(maxParticles * 9) // x, y, z, vx, vy, vz, life, size, alpha
    this.initializeParticles()
    this.createShaders()
  }

  private initializeParticles() {
    this.particleBuffer = this.gl.createBuffer()
  }

  private createShaders() {
    const vertexShaderSource = `
      attribute vec3 a_position;
      attribute float a_size;
      attribute float a_alpha;
      
      uniform mat4 u_modelViewMatrix;
      uniform mat4 u_projectionMatrix;
      uniform float u_time;
      
      varying float v_alpha;
      
      void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
        gl_PointSize = a_size;
        v_alpha = a_alpha;
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      
      varying float v_alpha;
      uniform float u_time;
      
      void main() {
        // Circular particle shape
        vec2 center = gl_PointCoord - vec2(0.5, 0.5);
        float dist = length(center);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Soft edges
        float alpha = (1.0 - dist * 2.0) * v_alpha;
        
        // Golden glow
        vec3 color = vec3(0.85, 0.65, 0.13);
        
        gl_FragColor = vec4(color, alpha);
      }
    `

    this.shaderManager.createProgram(vertexShaderSource, fragmentShaderSource, "particles")
  }

  update(deltaTime: number) {
    // Update particle physics with object pooling
    for (let i = 0; i < this.activeParticles; i++) {
      const offset = i * 9

      // Update position
      this.particles[offset] += this.particles[offset + 3] * deltaTime
      this.particles[offset + 1] += this.particles[offset + 4] * deltaTime
      this.particles[offset + 2] += this.particles[offset + 5] * deltaTime

      // Update life
      this.particles[offset + 6] -= deltaTime * 0.001

      // Update alpha based on life
      this.particles[offset + 8] = Math.max(0, this.particles[offset + 6])

      // Recycle dead particles
      if (this.particles[offset + 6] <= 0) {
        this.recycleParticle(i)
      }
    }
  }

  private recycleParticle(index: number) {
    // Move last active particle to this position
    if (index < this.activeParticles - 1) {
      const lastOffset = (this.activeParticles - 1) * 9
      const currentOffset = index * 9

      for (let i = 0; i < 9; i++) {
        this.particles[currentOffset + i] = this.particles[lastOffset + i]
      }
    }

    this.activeParticles--
  }

  emit(x: number, y: number, z: number, count = 1) {
    for (let i = 0; i < count && this.activeParticles < this.maxParticles; i++) {
      const offset = this.activeParticles * 9

      // Position
      this.particles[offset] = x + (Math.random() - 0.5) * 0.1
      this.particles[offset + 1] = y + (Math.random() - 0.5) * 0.1
      this.particles[offset + 2] = z + (Math.random() - 0.5) * 0.1

      // Velocity
      this.particles[offset + 3] = (Math.random() - 0.5) * 0.002
      this.particles[offset + 4] = (Math.random() - 0.5) * 0.002
      this.particles[offset + 5] = (Math.random() - 0.5) * 0.002

      // Life
      this.particles[offset + 6] = 1.0

      // Size
      this.particles[offset + 7] = Math.random() * 10 + 5

      // Alpha
      this.particles[offset + 8] = 1.0

      this.activeParticles++
    }
  }

  render(
    gl: WebGLRenderingContext,
    shaderManager: ShaderManager,
    modelViewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    time: number,
  ) {
    if (this.activeParticles === 0) return

    const program = shaderManager.getProgram("particles")
    if (!program || !this.particleBuffer) return

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, "a_position")
    const sizeLocation = gl.getAttribLocation(program, "a_size")
    const alphaLocation = gl.getAttribLocation(program, "a_alpha")

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 9 * 4, 0)

    gl.enableVertexAttribArray(sizeLocation)
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 9 * 4, 7 * 4)

    gl.enableVertexAttribArray(alphaLocation)
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 9 * 4, 8 * 4)

    // Set uniforms
    const modelViewLocation = gl.getUniformLocation(program, "u_modelViewMatrix")
    const projectionLocation = gl.getUniformLocation(program, "u_projectionMatrix")
    const timeLocation = gl.getUniformLocation(program, "u_time")

    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix)
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix)
    gl.uniform1f(timeLocation, time)

    // Render particles
    gl.drawArrays(gl.POINTS, 0, this.activeParticles)
  }

  getActiveCount() {
    return this.activeParticles
  }
}

// Matrix utilities
class Matrix4 {
  static identity(): Float32Array {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
  }

  static perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov)
    const rangeInv = 1.0 / (near - far)

    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ])
  }

  static rotateY(matrix: Float32Array, angle: number): Float32Array {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const result = new Float32Array(matrix)

    result[0] = matrix[0] * cos + matrix[8] * sin
    result[2] = matrix[2] * cos + matrix[10] * sin
    result[8] = matrix[8] * cos - matrix[0] * sin
    result[10] = matrix[10] * cos - matrix[2] * sin

    return result
  }
}

export function WebGLPerformanceEngine({
  className = "",
  enableParticles = true,
  enableSacredGeometry = true,
  quality = "high",
}: WebGLPerformanceEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const animationFrameRef = useRef<number>()
  const [isInitialized, setIsInitialized] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memory: 0,
    particles: 0,
    quality: "high",
  })

  // Initialize WebGL and systems
  const performanceOptimizer = useMemo(() => new PerformanceOptimizer(), [])
  const [shaderManager, setShaderManager] = useState<ShaderManager | null>(null)
  const [sacredGeometry, setSacredGeometry] = useState<SacredGeometry3D | null>(null)
  const [particleSystem, setParticleSystem] = useState<ParticleSystem3D | null>(null)

  const initializeWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: quality !== "low",
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: quality === "ultra" ? "high-performance" : "default",
    })

    if (!gl) {
      console.error("WebGL not supported")
      return false
    }

    glRef.current = gl

    // Initialize systems
    const sm = new ShaderManager(gl)
    setShaderManager(sm)

    if (enableSacredGeometry) {
      setSacredGeometry(new SacredGeometry3D(gl, sm))
    }

    if (enableParticles) {
      const maxParticles = quality === "low" ? 200 : quality === "medium" ? 500 : quality === "high" ? 1000 : 2000
      setParticleSystem(new ParticleSystem3D(gl, sm, maxParticles))
    }

    // WebGL setup
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0.03, 0.05, 0.15, 0.0) // Transparent dark navy

    console.log("[v0] WebGL Performance Engine initialized")
    return true
  }, [enableParticles, enableSacredGeometry, quality])

  const render = useCallback(
    (time: number) => {
      const gl = glRef.current
      const canvas = canvasRef.current
      if (!gl || !canvas) return

      // Update performance metrics
      performanceOptimizer.updateMetrics(time)

      // Resize canvas if needed
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, displayWidth, displayHeight)
      }

      // Clear
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Set up matrices
      const aspect = displayWidth / displayHeight
      const projectionMatrix = Matrix4.perspective(Math.PI / 4, aspect, 0.1, 100.0)
      let modelViewMatrix = Matrix4.identity()
      modelViewMatrix = Matrix4.rotateY(modelViewMatrix, time * 0.0005)

      // Render sacred geometry
      if (sacredGeometry && enableSacredGeometry) {
        const alpha = performanceOptimizer.getQuality() === "low" ? 0.4 : 0.8
        sacredGeometry.render(gl, shaderManager!, time, modelViewMatrix, projectionMatrix, alpha)
      }

      // Update and render particles
      if (particleSystem && enableParticles) {
        particleSystem.update(16.67) // Assume 60fps for delta time

        // Emit particles based on mouse interaction or automatic emission
        if (Math.random() < 0.1) {
          const x = (Math.random() - 0.5) * 2
          const y = (Math.random() - 0.5) * 2
          const z = (Math.random() - 0.5) * 0.5
          particleSystem.emit(x, y, z, performanceOptimizer.getQuality() === "low" ? 1 : 3)
        }

        particleSystem.render(gl, shaderManager!, modelViewMatrix, projectionMatrix, time)
      }

      // Update performance metrics for UI
      setPerformanceMetrics({
        fps: performanceOptimizer.getFPS(),
        memory: performanceOptimizer.getMemoryUsage(),
        particles: particleSystem?.getActiveCount() || 0,
        quality: performanceOptimizer.getQuality(),
      })

      animationFrameRef.current = requestAnimationFrame(render)
    },
    [sacredGeometry, particleSystem, enableSacredGeometry, enableParticles, performanceOptimizer, shaderManager],
  )

  useEffect(() => {
    if (initializeWebGL()) {
      setIsInitialized(true)
      animationFrameRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initializeWebGL, render])

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!particleSystem || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = (1 - (event.clientY - rect.top) / rect.height) * 2 - 1

      // Emit particles at click location
      particleSystem.emit(x, y, 0, 20)

      console.log(`[v0] Particle emission at (${x.toFixed(2)}, ${y.toFixed(2)})`)
    },
    [particleSystem],
  )

  if (!isInitialized) {
    return (
      <Card className={`luxury-glass-morphism border border-primary/20 p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing 3D Sacred Geometry Engine...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`luxury-glass-morphism border border-primary/20 overflow-hidden ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-pointer"
          onClick={handleCanvasClick}
          style={{ background: "transparent" }}
        />

        {/* Performance overlay */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">FPS:</span>
            <span
              className={
                performanceMetrics.fps >= 50
                  ? "text-green-400"
                  : performanceMetrics.fps >= 30
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {performanceMetrics.fps}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Memory:</span>
            <span
              className={
                performanceMetrics.memory < 150
                  ? "text-green-400"
                  : performanceMetrics.memory < 300
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {performanceMetrics.memory.toFixed(1)}MB
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Particles:</span>
            <span className="text-accent">{performanceMetrics.particles}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Quality:</span>
            <span className="text-primary capitalize">{performanceMetrics.quality}</span>
          </div>
        </div>

        {/* Interaction hint */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs">
          <p className="text-muted-foreground">Click to emit sacred particles</p>
        </div>
      </div>
    </Card>
  )
}
