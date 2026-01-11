"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useStateDAG } from "@/hooks/use-state-dag"
import { useEventBus } from "@/hooks/use-event-bus"
import { EventTypes } from "@/lib/event-bus"
import { Plus, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NodePosition {
  id: string
  x: number
  y: number
  depth: number
}

export function DAGVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { nodes, metrics, createNode, isLoading } = useStateDAG()
  const { emit } = useEventBus()
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const nodePositionsRef = useRef<Map<string, NodePosition>>(new Map())

  const calculateNodePositions = useCallback(() => {
    const positions = new Map<string, NodePosition>()

    // Group nodes by depth
    const depthMap = new Map<number, string[]>()
    const nodeDepths = new Map<string, number>()

    // Calculate depths using BFS
    const queue: { id: string; depth: number }[] = []
    const visited = new Set<string>()

    // Find root nodes
    for (const node of nodes) {
      if (node.parents.length === 0) {
        queue.push({ id: node.id, depth: 0 })
      }
    }

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)

      nodeDepths.set(id, depth)
      if (!depthMap.has(depth)) {
        depthMap.set(depth, [])
      }
      depthMap.get(depth)!.push(id)

      // Find children
      for (const node of nodes) {
        if (node.parents.includes(id)) {
          queue.push({ id: node.id, depth: depth + 1 })
        }
      }
    }

    // Assign positions
    const levelSpacing = 120
    const nodeSpacing = 100

    for (const [depth, nodeIds] of depthMap) {
      const levelWidth = nodeIds.length * nodeSpacing
      const startX = -levelWidth / 2 + nodeSpacing / 2

      nodeIds.forEach((id, index) => {
        positions.set(id, {
          id,
          x: startX + index * nodeSpacing,
          y: depth * levelSpacing,
          depth,
        })
      })
    }

    nodePositionsRef.current = positions
    return positions
  }, [nodes])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear
    ctx.fillStyle = "rgba(8, 12, 24, 1)"
    ctx.fillRect(0, 0, rect.width, rect.height)

    const positions = calculateNodePositions()

    // Center offset
    const centerX = rect.width / 2
    const centerY = 80

    // Draw grid
    ctx.strokeStyle = "rgba(34, 42, 60, 0.5)"
    ctx.lineWidth = 1
    for (let x = 0; x < rect.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Apply zoom
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(zoom, zoom)

    // Draw edges
    for (const node of nodes) {
      const nodePos = positions.get(node.id)
      if (!nodePos) continue

      for (const parentId of node.parents) {
        const parentPos = positions.get(parentId)
        if (!parentPos) continue

        const gradient = ctx.createLinearGradient(parentPos.x, parentPos.y, nodePos.x, nodePos.y)
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.3)")
        gradient.addColorStop(1, "rgba(52, 211, 153, 0.3)")

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(parentPos.x, parentPos.y + 15)

        // Bezier curve for smoother edges
        const midY = (parentPos.y + nodePos.y) / 2
        ctx.bezierCurveTo(parentPos.x, midY, nodePos.x, midY, nodePos.x, nodePos.y - 15)
        ctx.stroke()

        // Arrow head
        const angle = Math.atan2(nodePos.y - midY, nodePos.x - parentPos.x)
        ctx.fillStyle = "rgba(52, 211, 153, 0.5)"
        ctx.beginPath()
        ctx.moveTo(nodePos.x, nodePos.y - 15)
        ctx.lineTo(nodePos.x - 6 * Math.cos(angle - 0.5), nodePos.y - 15 - 6 * Math.sin(angle - 0.5))
        ctx.lineTo(nodePos.x - 6 * Math.cos(angle + 0.5), nodePos.y - 15 - 6 * Math.sin(angle + 0.5))
        ctx.closePath()
        ctx.fill()
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const pos = positions.get(node.id)
      if (!pos) continue

      const isSelected = selectedNode === node.id
      const isHovered = hoveredNode === node.id
      const isGenesis = node.parents.length === 0

      // Node glow
      if (isSelected || isHovered) {
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 30)
        glow.addColorStop(0, isGenesis ? "rgba(52, 211, 153, 0.4)" : "rgba(56, 189, 248, 0.4)")
        glow.addColorStop(1, "transparent")
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2)
        ctx.fill()
      }

      // Node circle
      ctx.fillStyle = isGenesis ? "rgba(52, 211, 153, 0.2)" : "rgba(56, 189, 248, 0.2)"
      ctx.strokeStyle = isGenesis ? "rgb(52, 211, 153)" : "rgb(56, 189, 248)"
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Node label
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = '10px "Geist Mono", monospace'
      ctx.textAlign = "center"
      ctx.fillText(node.id.slice(0, 8), pos.x, pos.y + 30)
    }

    ctx.restore()
  }, [nodes, zoom, selectedNode, hoveredNode, calculateNodePositions])

  useEffect(() => {
    draw()

    const handleResize = () => draw()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [draw])

  const handleCreateNode = async () => {
    const payload = {
      type: "USER_ACTION",
      action: "MANUAL_CREATE",
      data: { timestamp: Date.now() },
    }

    await createNode(payload)
    emit(EventTypes.STATE_TRANSITION, { type: "node_created" }, 1)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-sm text-foreground">State DAG Visualizer</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/20 text-accent">LIVE</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 font-mono text-xs bg-transparent"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="font-mono text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 font-mono text-xs bg-transparent"
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 font-mono text-xs bg-transparent"
            onClick={() => setZoom(1)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 font-mono text-xs bg-transparent"
            onClick={handleCreateNode}
          >
            <Plus className="h-3 w-3 mr-1" />
            Node
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: "grab" }} />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Metrics Footer */}
      <div className="flex items-center gap-6 px-4 py-2 border-t border-border bg-card/50">
        <div className="font-mono text-xs">
          <span className="text-muted-foreground">Nodes:</span>
          <span className="ml-1 text-foreground">{metrics?.totalNodes ?? 0}</span>
        </div>
        <div className="font-mono text-xs">
          <span className="text-muted-foreground">Edges:</span>
          <span className="ml-1 text-foreground">{metrics?.totalEdges ?? 0}</span>
        </div>
        <div className="font-mono text-xs">
          <span className="text-muted-foreground">Depth:</span>
          <span className="ml-1 text-foreground">{metrics?.depth ?? 0}</span>
        </div>
        <div className="font-mono text-xs">
          <span className="text-muted-foreground">Branch Factor:</span>
          <span className="ml-1 text-foreground">{metrics?.branchFactor ?? 0}</span>
        </div>
        <div className="font-mono text-xs">
          <span className="text-muted-foreground">Verified:</span>
          <span className="ml-1 text-accent">{((metrics?.verifiedRatio ?? 0) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
