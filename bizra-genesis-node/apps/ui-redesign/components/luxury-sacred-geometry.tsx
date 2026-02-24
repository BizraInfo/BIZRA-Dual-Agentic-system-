"use client"

import { useEffect, useState } from "react"

export function LuxurySacredGeometry() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    const checkPerformance = () => {
      const connection = (navigator as any).connection
      const memory = (navigator as any).deviceMemory

      if (connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g" || memory < 4) {
        setIsLowPerformance(true)
      }
    }

    checkPerformance()

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (prefersReducedMotion || isLowPerformance) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Luxury Golden Spiral */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 luxury-sacred-geometry">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin" style={{ animationDuration: "120s" }}>
          <path
            d="M100,100 Q150,100 150,50 Q150,0 100,0 Q50,0 50,50 Q50,100 100,100 Q200,100 200,0 Q200,-100 100,-100 Q0,-100 0,0 Q0,100 100,100"
            fill="none"
            stroke="oklch(0.85 0.15 85)"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 8px oklch(0.85 0.15 85 / 0.3))"
          />
        </svg>
      </div>

      {/* Luxury Flower of Life */}
      <div className="absolute top-3/4 right-1/4 w-64 h-64 luxury-sacred-geometry">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i * 60 * Math.PI) / 180
            const x = 100 + 35 * Math.cos(angle)
            const y = 100 + 35 * Math.sin(angle)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="35"
                fill="none"
                stroke="oklch(0.25 0.08 240)"
                strokeWidth="1.2"
                filter="drop-shadow(0 0 6px oklch(0.25 0.08 240 / 0.25))"
              />
            )
          })}
          <circle
            cx="100"
            cy="100"
            r="35"
            fill="none"
            stroke="oklch(0.85 0.15 85)"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 10px oklch(0.85 0.15 85 / 0.4))"
          />
        </svg>
      </div>

      {/* Luxury Metatron's Cube */}
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 luxury-sacred-geometry">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-pulse" style={{ animationDuration: "15s" }}>
          <polygon
            points="100,15 175,55 175,145 100,185 25,145 25,55"
            fill="none"
            stroke="oklch(0.25 0.08 240)"
            strokeWidth="1.2"
            filter="drop-shadow(0 0 8px oklch(0.25 0.08 240 / 0.3))"
          />
          <line x1="100" y1="15" x2="100" y2="185" stroke="oklch(0.85 0.15 85)" strokeWidth="0.8" />
          <line x1="25" y1="55" x2="175" y2="145" stroke="oklch(0.85 0.15 85)" strokeWidth="0.8" />
          <line x1="25" y1="145" x2="175" y2="55" stroke="oklch(0.85 0.15 85)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Additional luxury geometric elements */}
      <div className="absolute top-1/2 right-1/3 w-48 h-48 luxury-sacred-geometry opacity-8">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ animation: "golden-luxury-spiral 60s linear infinite" }}
        >
          <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="oklch(0.85 0.15 85)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="oklch(0.25 0.08 240)" strokeWidth="0.6" />
        </svg>
      </div>
    </div>
  )
}
