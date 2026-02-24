"use client"

import { useEffect, useState } from "react"
import { useEventBus } from "@/hooks/use-event-bus"
import { Layers, ArrowRight, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QueueSlot {
  id: number
  occupied: boolean
  priority: number
  type: string
}

export function QueueInspector() {
  const { events, metrics } = useEventBus()
  const [isPaused, setIsPaused] = useState(false)
  const [queueSlots, setQueueSlots] = useState<QueueSlot[]>([])

  useEffect(() => {
    if (isPaused) return

    // Simulate ring buffer state (64 slots)
    const slots: QueueSlot[] = Array.from({ length: 64 }, (_, i) => ({
      id: i,
      occupied: Math.random() > 0.7,
      priority: Math.floor(Math.random() * 4),
      type: ["state", "render", "proof", "ai"][Math.floor(Math.random() * 4)],
    }))
    setQueueSlots(slots)
  }, [events, isPaused])

  const priorityColors = ["bg-destructive", "bg-chart-3", "bg-chart-1", "bg-muted-foreground"]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Queue Inspector</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 font-mono text-[10px] bg-transparent"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>

      {/* Ring Buffer Visualization */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
            SharedArrayBuffer Ring Buffer (64KB)
          </div>
          <div className="grid grid-cols-16 gap-1">
            {queueSlots.map((slot) => (
              <div
                key={slot.id}
                className={`w-full aspect-square rounded-sm transition-all duration-150 ${
                  slot.occupied ? priorityColors[slot.priority] : "bg-muted/30"
                } ${slot.occupied ? "opacity-100" : "opacity-30"}`}
                title={slot.occupied ? `Slot ${slot.id}: ${slot.type} (P${slot.priority})` : `Slot ${slot.id}: Empty`}
              />
            ))}
          </div>
        </div>

        {/* Cursor Positions */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-mono text-[10px] text-muted-foreground w-20">Write Cursor</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 rounded-full transition-all duration-150"
                  style={{ width: `${((Date.now() % 64000) / 64000) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-foreground w-12 text-right">
                {Math.floor((Date.now() % 64000) / 1000)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-mono text-[10px] text-muted-foreground w-20">Read Cursor</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-150"
                  style={{ width: `${(((Date.now() - 500) % 64000) / 64000) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-foreground w-12 text-right">
                {Math.floor(((Date.now() - 500) % 64000) / 1000)}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Layout */}
        <div className="mt-6 p-3 bg-card border border-border rounded-lg">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Memory Layout</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-chart-1/30 rounded flex items-center justify-center">
                <span className="font-mono text-[8px] text-chart-1">0-7</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">Write cursor (Atomics.add)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-accent/30 rounded flex items-center justify-center">
                <span className="font-mono text-[8px] text-accent">8-15</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">Read cursor (Atomics.load)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-chart-4/30 rounded flex items-center justify-center">
                <span className="font-mono text-[8px] text-chart-4">16-23</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">Generation counter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-chart-3/30 rounded flex items-center justify-center">
                <span className="font-mono text-[8px] text-chart-3">64+</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">Event slots (128B each)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/50">
        <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
          <span>Depth: {metrics?.queueDepth ?? 0}</span>
          <span>Dropped: {metrics?.droppedEvents ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((p) => (
            <div key={p} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${priorityColors[p]}`} />
              <span className="font-mono text-[10px] text-muted-foreground">P{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
