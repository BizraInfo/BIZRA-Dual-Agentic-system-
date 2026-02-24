"use client"

import { useEffect, useRef } from "react"
import { useEventBus } from "@/hooks/use-event-bus"
import { Radio, ChevronRight } from "lucide-react"

const priorityLabels = ["CRIT", "HIGH", "NORM", "LOW"]
const priorityColors = ["text-destructive", "text-chart-3", "text-chart-1", "text-muted-foreground"]

export function EventStream() {
  const { events, metrics } = useEventBus()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [events])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <h2 className="font-mono text-sm text-foreground">Event Stream</h2>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-muted-foreground">{metrics?.eventsPerSecond ?? 0} evt/s</span>
          <span className="text-muted-foreground">{metrics?.avgLatencyNs ?? 0}ns avg</span>
        </div>
      </div>

      {/* Event List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            Awaiting events...
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div key={event.id} className="px-4 py-2 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  {/* Priority Badge */}
                  <span className={`font-mono text-[10px] font-semibold ${priorityColors[event.priority]}`}>
                    {priorityLabels[event.priority]}
                  </span>

                  {/* Timestamp */}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date(event.timestamp).toISOString().split("T")[1].slice(0, 12)}
                  </span>

                  {/* Event Type */}
                  <span className="font-mono text-xs text-foreground">{event.type}</span>

                  {/* Source */}
                  <span className="font-mono text-[10px] text-muted-foreground ml-auto">{event.source}</span>

                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Payload Preview */}
                {Object.keys(event.payload).length > 0 && (
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                    {JSON.stringify(event.payload).slice(0, 80)}
                    {JSON.stringify(event.payload).length > 80 && "..."}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-card/50 font-mono text-[10px] text-muted-foreground">
        <span>Total: {metrics?.totalEvents ?? 0}</span>
        <span>Queue: {metrics?.queueDepth ?? 0}</span>
        <span>Dropped: {metrics?.droppedEvents ?? 0}</span>
      </div>
    </div>
  )
}
