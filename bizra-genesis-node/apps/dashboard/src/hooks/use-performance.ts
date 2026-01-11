"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpuEstimate: number
  jankCount: number
  timestamp: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memory: { used: 0, total: 0, percentage: 0 },
    cpuEstimate: 0,
    jankCount: 0,
    timestamp: Date.now(),
  })

  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef(performance.now())
  const jankCountRef = useRef(0)
  const rafIdRef = useRef<number>(0)

  const measureFrame = useCallback(() => {
    const now = performance.now()
    const delta = now - lastFrameTimeRef.current
    lastFrameTimeRef.current = now

    frameTimesRef.current.push(delta)
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift()
    }

    // Detect jank (frame > 16.67ms for 60fps target)
    if (delta > 16.67) {
      jankCountRef.current++
    }

    // Calculate metrics every 500ms
    if (frameTimesRef.current.length >= 30) {
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
      const fps = Math.round(1000 / avgFrameTime)

      // Memory info (if available)
      const memInfo = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } })
        .memory
      const memory = memInfo
        ? {
            used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
            percentage: Math.round((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100),
          }
        : { used: 0, total: 0, percentage: 0 }

      // CPU estimate based on frame budget utilization
      const cpuEstimate = Math.min(100, Math.round((avgFrameTime / 16.67) * 100))

      setMetrics({
        fps,
        frameTime: Math.round(avgFrameTime * 100) / 100,
        memory,
        cpuEstimate,
        jankCount: jankCountRef.current,
        timestamp: Date.now(),
      })
    }

    rafIdRef.current = requestAnimationFrame(measureFrame)
  }, [])

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(measureFrame)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [measureFrame])

  return metrics
}
