export interface IhsanMetrics {
  overallScore: number
  accessibility: number
  sustainability: number
  intentClarity: number
  violations: IhsanViolation[]
  timestamp: number
}

export interface IhsanViolation {
  id: string
  type: "accessibility" | "sustainability" | "clarity" | "motion"
  severity: "warning" | "critical"
  message: string
  element?: string
  timestamp: number
}

export interface IhsanConstraints {
  minContrastRatio: number
  maxFlickerHz: number
  maxGpuWatts: number
  minIhsanScore: number
}

const DEFAULT_CONSTRAINTS: IhsanConstraints = {
  minContrastRatio: 4.5,
  maxFlickerHz: 3,
  maxGpuWatts: 15,
  minIhsanScore: 0.99,
}

class IhsanEngine {
  private constraints: IhsanConstraints = DEFAULT_CONSTRAINTS
  private violations: IhsanViolation[] = []
  private currentMetrics: IhsanMetrics
  private listeners: Set<(metrics: IhsanMetrics) => void> = new Set()
  private violationCounter = 0

  constructor() {
    this.currentMetrics = this.computeMetrics()
  }

  private computeMetrics(): IhsanMetrics {
    // Simulate real-time metric computation
    const accessibility = 0.95 + Math.random() * 0.05
    const sustainability = 0.92 + Math.random() * 0.08
    const intentClarity = 0.96 + Math.random() * 0.04

    const overallScore = accessibility * 0.4 + sustainability * 0.3 + intentClarity * 0.3

    return {
      overallScore: Math.round(overallScore * 1000) / 1000,
      accessibility: Math.round(accessibility * 1000) / 1000,
      sustainability: Math.round(sustainability * 1000) / 1000,
      intentClarity: Math.round(intentClarity * 1000) / 1000,
      violations: this.violations.slice(-10),
      timestamp: Date.now(),
    }
  }

  checkConstraints(): IhsanMetrics {
    this.currentMetrics = this.computeMetrics()

    // Check for violations
    if (this.currentMetrics.accessibility < 0.95) {
      this.addViolation("accessibility", "warning", "Contrast ratio below optimal threshold")
    }
    if (this.currentMetrics.sustainability < 0.9) {
      this.addViolation("sustainability", "warning", "GPU utilization exceeding efficiency target")
    }
    if (this.currentMetrics.overallScore < this.constraints.minIhsanScore) {
      this.addViolation(
        "clarity",
        "critical",
        `Ihsan score ${this.currentMetrics.overallScore} below minimum ${this.constraints.minIhsanScore}`,
      )
    }

    this.notifyListeners()
    return this.currentMetrics
  }

  private addViolation(
    type: IhsanViolation["type"],
    severity: IhsanViolation["severity"],
    message: string,
    element?: string,
  ) {
    const violation: IhsanViolation = {
      id: `viol_${++this.violationCounter}`,
      type,
      severity,
      message,
      element,
      timestamp: Date.now(),
    }
    this.violations.push(violation)

    // Keep only recent violations
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100)
    }
  }

  getMetrics(): IhsanMetrics {
    return this.currentMetrics
  }

  getConstraints(): IhsanConstraints {
    return { ...this.constraints }
  }

  updateConstraints(updates: Partial<IhsanConstraints>) {
    this.constraints = { ...this.constraints, ...updates }
  }

  subscribe(listener: (metrics: IhsanMetrics) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentMetrics)
    }
  }
}

let ihsanInstance: IhsanEngine | null = null

export function getIhsanEngine(): IhsanEngine {
  if (!ihsanInstance) {
    ihsanInstance = new IhsanEngine()
  }
  return ihsanInstance
}
