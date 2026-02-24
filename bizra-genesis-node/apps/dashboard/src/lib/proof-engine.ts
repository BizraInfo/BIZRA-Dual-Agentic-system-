export interface Proof {
  id: string
  circuitId: string
  publicInputs: string[]
  proof: string
  timestamp: number
  verificationTime: number
  status: "pending" | "verified" | "failed"
}

export interface ProofMetrics {
  totalProofs: number
  verifiedProofs: number
  failedProofs: number
  avgGenerationTimeMs: number
  avgVerificationTimeMs: number
  pendingQueue: number
}

class ProofEngine {
  private proofs: Map<string, Proof> = new Map()
  private generationTimes: number[] = []
  private verificationTimes: number[] = []
  private proofCounter = 0
  private pendingCount = 0
  private listeners: Set<(proof: Proof) => void> = new Set()

  async generateProof(
    circuitId: string,
    publicInputs: string[],
    privateWitness: Record<string, unknown>,
  ): Promise<Proof> {
    const startTime = performance.now()
    this.pendingCount++

    // Simulate zk-SNARK proof generation (50-150ms)
    const generationTime = 50 + Math.random() * 100
    await new Promise((resolve) => setTimeout(resolve, generationTime))

    // Generate simulated proof bytes
    const proofBytes = new Uint8Array(192)
    crypto.getRandomValues(proofBytes)
    const proofHex = Array.from(proofBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const proof: Proof = {
      id: `proof_${++this.proofCounter}_${Date.now()}`,
      circuitId,
      publicInputs,
      proof: proofHex,
      timestamp: Date.now(),
      verificationTime: 0,
      status: "pending",
    }

    this.proofs.set(proof.id, proof)
    this.generationTimes.push(performance.now() - startTime)
    this.pendingCount--

    // Auto-verify
    await this.verifyProof(proof.id)

    return proof
  }

  async verifyProof(proofId: string): Promise<boolean> {
    const proof = this.proofs.get(proofId)
    if (!proof) return false

    const startTime = performance.now()

    // Simulate verification (10-50ms)
    const verificationTime = 10 + Math.random() * 40
    await new Promise((resolve) => setTimeout(resolve, verificationTime))

    // 98% success rate simulation
    const isValid = Math.random() > 0.02

    proof.verificationTime = performance.now() - startTime
    proof.status = isValid ? "verified" : "failed"
    this.verificationTimes.push(proof.verificationTime)

    this.notifyListeners(proof)
    return isValid
  }

  getProof(id: string): Proof | undefined {
    return this.proofs.get(id)
  }

  getRecentProofs(count = 20): Proof[] {
    return Array.from(this.proofs.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }

  getMetrics(): ProofMetrics {
    const allProofs = Array.from(this.proofs.values())
    const verified = allProofs.filter((p) => p.status === "verified").length
    const failed = allProofs.filter((p) => p.status === "failed").length

    return {
      totalProofs: allProofs.length,
      verifiedProofs: verified,
      failedProofs: failed,
      avgGenerationTimeMs:
        this.generationTimes.length > 0
          ? Math.round(this.generationTimes.reduce((a, b) => a + b, 0) / this.generationTimes.length)
          : 0,
      avgVerificationTimeMs:
        this.verificationTimes.length > 0
          ? Math.round(this.verificationTimes.reduce((a, b) => a + b, 0) / this.verificationTimes.length)
          : 0,
      pendingQueue: this.pendingCount,
    }
  }

  subscribe(listener: (proof: Proof) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(proof: Proof) {
    for (const listener of this.listeners) {
      listener(proof)
    }
  }
}

let engineInstance: ProofEngine | null = null

export function getProofEngine(): ProofEngine {
  if (!engineInstance) {
    engineInstance = new ProofEngine()
  }
  return engineInstance
}
