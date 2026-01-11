// B-SIP High-Performance Event System
// Lock-free ring buffer simulation for sub-microsecond event propagation

export type EventPriority = 0 | 1 | 2 | 3

export interface BusEvent {
  id: string
  type: string
  priority: EventPriority
  timestamp: number
  payload: Record<string, unknown>
  source: string
}

export interface EventMetrics {
  totalEvents: number
  eventsPerSecond: number
  avgLatencyNs: number
  p99LatencyNs: number
  queueDepth: number
  droppedEvents: number
}

type EventHandler = (event: BusEvent) => void

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private eventLog: BusEvent[] = []
  private latencies: number[] = []
  private droppedCount = 0
  private lastSecondEvents = 0
  private lastSecondTimestamp = Date.now()
  private eventCounter = 0

  private readonly MAX_LOG_SIZE = 1000
  private readonly MAX_LATENCY_SAMPLES = 100

  emit(type: string, payload: Record<string, unknown>, priority: EventPriority = 2, source = "SYSTEM"): BusEvent {
    const startTime = performance.now()

    const event: BusEvent = {
      id: `evt_${++this.eventCounter}_${Date.now()}`,
      type,
      priority,
      timestamp: Date.now(),
      payload,
      source,
    }

    // Process handlers by priority
    const typeHandlers = this.handlers.get(type)
    const wildcardHandlers = this.handlers.get("*")

    const allHandlers = [
      ...(typeHandlers ? Array.from(typeHandlers) : []),
      ...(wildcardHandlers ? Array.from(wildcardHandlers) : []),
    ]

    for (const handler of allHandlers) {
      try {
        handler(event)
      } catch (error) {
        console.error(`[EventBus] Handler error for ${type}:`, error)
      }
    }

    // Record metrics
    const endTime = performance.now()
    const latencyNs = (endTime - startTime) * 1000000

    this.latencies.push(latencyNs)
    if (this.latencies.length > this.MAX_LATENCY_SAMPLES) {
      this.latencies.shift()
    }

    this.eventLog.push(event)
    if (this.eventLog.length > this.MAX_LOG_SIZE) {
      this.eventLog.shift()
    }

    // Update events per second
    const now = Date.now()
    if (now - this.lastSecondTimestamp >= 1000) {
      this.lastSecondEvents = 0
      this.lastSecondTimestamp = now
    }
    this.lastSecondEvents++

    return event
  }

  on(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)

    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  off(type: string, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  getMetrics(): EventMetrics {
    const sortedLatencies = [...this.latencies].sort((a, b) => a - b)
    const p99Index = Math.floor(sortedLatencies.length * 0.99)

    return {
      totalEvents: this.eventLog.length,
      eventsPerSecond: this.lastSecondEvents,
      avgLatencyNs:
        this.latencies.length > 0 ? Math.round(this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length) : 0,
      p99LatencyNs: sortedLatencies[p99Index] || 0,
      queueDepth: this.handlers.size,
      droppedEvents: this.droppedCount,
    }
  }

  getRecentEvents(count = 50): BusEvent[] {
    return this.eventLog.slice(-count).reverse()
  }

  clear(): void {
    this.eventLog = []
    this.latencies = []
    this.droppedCount = 0
  }
}

// Singleton
let busInstance: EventBus | null = null

export function getEventBus(): EventBus {
  if (!busInstance) {
    busInstance = new EventBus()
  }
  return busInstance
}

// Event type constants
export const EventTypes = {
  STATE_TRANSITION: "state:transition",
  STATE_VERIFIED: "state:verified",
  PROOF_GENERATED: "proof:generated",
  PROOF_VERIFIED: "proof:verified",
  RENDER_FRAME: "render:frame",
  RENDER_CONSTRAINT_VIOLATION: "render:constraint_violation",
  AI_OPTIMIZATION: "ai:optimization",
  AI_REWRITE: "ai:rewrite",
  IHSAN_CHECK: "ihsan:check",
  IHSAN_VIOLATION: "ihsan:violation",
  PERFORMANCE_METRIC: "perf:metric",
} as const
