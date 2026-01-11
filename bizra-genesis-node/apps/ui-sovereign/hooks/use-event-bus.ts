"use client"

import { useState, useEffect, useCallback } from "react"
import { getEventBus, type BusEvent, type EventMetrics, type EventPriority } from "@/lib/event-bus"

export function useEventBus() {
  const [events, setEvents] = useState<BusEvent[]>([])
  const [metrics, setMetrics] = useState<EventMetrics | null>(null)

  const bus = getEventBus()

  useEffect(() => {
    // Subscribe to all events
    const unsubscribe = bus.on("*", () => {
      setEvents(bus.getRecentEvents())
      setMetrics(bus.getMetrics())
    })

    // Initial state
    setEvents(bus.getRecentEvents())
    setMetrics(bus.getMetrics())

    return unsubscribe
  }, [bus])

  const emit = useCallback(
    (type: string, payload: Record<string, unknown>, priority: EventPriority = 2) => {
      return bus.emit(type, payload, priority)
    },
    [bus],
  )

  return {
    events,
    metrics,
    emit,
  }
}
