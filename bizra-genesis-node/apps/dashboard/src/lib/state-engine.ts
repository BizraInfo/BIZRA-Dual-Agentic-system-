import { v7 as uuidv7 } from "uuid"

export interface StateNode {
  id: string
  payload: Record<string, unknown>
  parents: string[]
  merkleRoot: string
  timestamp: bigint
  metadata: {
    author: string
    signature?: string
    proofHash?: string
  }
}

export interface StateTransition {
  from: string
  to: string
  delta: Record<string, unknown>
  timestamp: bigint
  verified: boolean
}

export interface DAGMetrics {
  totalNodes: number
  totalEdges: number
  depth: number
  branchFactor: number
  orphanCount: number
  verifiedRatio: number
}

// Simulated Blake3 hash (in production, use actual Blake3)
async function blake3Hash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Compute Merkle root from node data
async function computeMerkleRoot(node: Omit<StateNode, "merkleRoot">): Promise<string> {
  const serialized = JSON.stringify({
    id: node.id,
    payload: node.payload,
    parents: node.parents,
    timestamp: node.timestamp.toString(),
  })
  return blake3Hash(serialized)
}

export class StateDAG {
  private nodes: Map<string, StateNode> = new Map()
  private edges: Map<string, string[]> = new Map()
  private head: string | null = null
  private listeners: Set<(node: StateNode) => void> = new Set()

  constructor() {
    this.initializeGenesis()
  }

  private async initializeGenesis() {
    const genesisNode: Omit<StateNode, "merkleRoot"> = {
      id: uuidv7(),
      payload: { type: "GENESIS", version: "1.0.0" },
      parents: [],
      timestamp: BigInt(Date.now()) * BigInt(1000000),
      metadata: { author: "SYSTEM" },
    }

    const merkleRoot = await computeMerkleRoot(genesisNode)
    const node: StateNode = { ...genesisNode, merkleRoot }

    this.nodes.set(node.id, node)
    this.edges.set(node.id, [])
    this.head = node.id
  }

  async createNode(payload: Record<string, unknown>, parents?: string[]): Promise<StateNode> {
    const parentIds = parents || (this.head ? [this.head] : [])

    const newNode: Omit<StateNode, "merkleRoot"> = {
      id: uuidv7(),
      payload,
      parents: parentIds,
      timestamp: BigInt(Date.now()) * BigInt(1000000),
      metadata: { author: "USER" },
    }

    const merkleRoot = await computeMerkleRoot(newNode)
    const node: StateNode = { ...newNode, merkleRoot }

    this.nodes.set(node.id, node)
    this.edges.set(node.id, [])

    // Update parent edges
    for (const parentId of parentIds) {
      const children = this.edges.get(parentId) || []
      children.push(node.id)
      this.edges.set(parentId, children)
    }

    this.head = node.id
    this.notifyListeners(node)

    return node
  }

  async verifyNode(nodeId: string): Promise<boolean> {
    const node = this.nodes.get(nodeId)
    if (!node) return false

    const { merkleRoot, ...rest } = node
    const computedRoot = await computeMerkleRoot(rest as Omit<StateNode, "merkleRoot">)
    return computedRoot === merkleRoot
  }

  getNode(id: string): StateNode | undefined {
    return this.nodes.get(id)
  }

  getChildren(id: string): string[] {
    return this.edges.get(id) || []
  }

  getAllNodes(): StateNode[] {
    return Array.from(this.nodes.values())
  }

  getMetrics(): DAGMetrics {
    const nodes = this.getAllNodes()
    const totalEdges = Array.from(this.edges.values()).reduce((sum, children) => sum + children.length, 0)

    // Calculate depth via BFS
    let maxDepth = 0
    const visited = new Set<string>()
    const queue: { id: string; depth: number }[] = []

    // Find root nodes (no parents)
    for (const node of nodes) {
      if (node.parents.length === 0) {
        queue.push({ id: node.id, depth: 0 })
      }
    }

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      maxDepth = Math.max(maxDepth, depth)

      const children = this.edges.get(id) || []
      for (const childId of children) {
        queue.push({ id: childId, depth: depth + 1 })
      }
    }

    const branchFactor = nodes.length > 1 ? totalEdges / (nodes.length - 1) : 0
    const orphanCount = nodes.filter((n) => n.parents.length === 0 && this.getChildren(n.id).length === 0).length

    return {
      totalNodes: nodes.length,
      totalEdges,
      depth: maxDepth,
      branchFactor: Math.round(branchFactor * 100) / 100,
      orphanCount,
      verifiedRatio: 1.0, // Simplified for demo
    }
  }

  subscribe(listener: (node: StateNode) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(node: StateNode) {
    for (const listener of this.listeners) {
      listener(node)
    }
  }
}

// Singleton instance
let dagInstance: StateDAG | null = null

export function getStateDAG(): StateDAG {
  if (!dagInstance) {
    dagInstance = new StateDAG()
  }
  return dagInstance
}
