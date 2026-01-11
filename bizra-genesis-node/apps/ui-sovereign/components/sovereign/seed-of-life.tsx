"use client"

import { useEffect, useState } from "react"

interface SeedOfLifeProps {
  size?: number
  animated?: boolean
  showLabels?: boolean
  className?: string
}

export function SeedOfLife({ size = 200, animated = true, showLabels = false, className = "" }: SeedOfLifeProps) {
  const [mounted, setMounted] = useState(false)
  const center = size / 2
  const radius = size * 0.2
  const innerRadius = radius * 0.75

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate positions for the 6 surrounding circles
  const surroundingCircles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180)
    return {
      cx: center + radius * Math.cos(angle),
      cy: center + radius * Math.sin(angle),
      delay: i * 0.1,
    }
  })

  // Calculate petal paths (Vesica Piscis intersections)
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = i * 60 * (Math.PI / 180)
    const nextAngle = (i + 1) * 60 * (Math.PI / 180)

    const x1 = center + innerRadius * Math.cos(angle - Math.PI / 2)
    const y1 = center + innerRadius * Math.sin(angle - Math.PI / 2)

    return {
      path: `M${center} ${center} Q${x1} ${y1} ${center} ${center - innerRadius} Q${center + innerRadius * Math.cos(angle + Math.PI / 6)} ${center + innerRadius * Math.sin(angle + Math.PI / 6)} ${center} ${center}`,
      delay: i * 0.08 + 0.6,
    }
  })

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A6B2E" />
          <stop offset="50%" stopColor="#C9A962" />
          <stop offset="100%" stopColor="#F9F1D8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer ring */}
      <circle
        cx={center}
        cy={center}
        r={radius * 2}
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="0.5"
        opacity={mounted && animated ? 1 : 0}
        style={{
          transition: "opacity 1s ease-out",
          transitionDelay: "1.2s",
        }}
      />

      {/* Center circle - The Seed (Nuqta) */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        filter="url(#glow)"
        opacity={mounted && animated ? 1 : 0}
        style={{
          transform: mounted && animated ? "scale(1)" : "scale(0)",
          transformOrigin: "center",
          transition: "all 0.8s ease-out",
        }}
      />

      {/* 6 Surrounding circles - The Creation */}
      {surroundingCircles.map((circle, i) => (
        <circle
          key={i}
          cx={circle.cx}
          cy={circle.cy}
          r={radius}
          fill="none"
          stroke="#C9A962"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity={mounted && animated ? 0.6 : 0}
          style={{
            transform: mounted && animated ? "scale(1)" : "scale(0)",
            transformOrigin: `${circle.cx}px ${circle.cy}px`,
            transition: "all 0.6s ease-out",
            transitionDelay: `${circle.delay + 0.3}s`,
          }}
        />
      ))}

      {/* The Flower petals - Ihsan (The Bloom) */}
      <g filter="url(#softGlow)">
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180)
          const petalLength = radius * 0.8
          const tipX = center + petalLength * Math.cos(angle)
          const tipY = center + petalLength * Math.sin(angle)
          const controlOffset = radius * 0.4

          return (
            <path
              key={`petal-${i}`}
              d={`
                M ${center} ${center}
                Q ${center + controlOffset * Math.cos(angle - 0.5)} ${center + controlOffset * Math.sin(angle - 0.5)}
                  ${tipX} ${tipY}
                Q ${center + controlOffset * Math.cos(angle + 0.5)} ${center + controlOffset * Math.sin(angle + 0.5)}
                  ${center} ${center}
              `}
              fill="url(#goldGradient)"
              opacity={mounted && animated ? 0.8 : 0}
              style={{
                transform: mounted && animated ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-30deg)",
                transformOrigin: "center",
                transition: "all 0.8s ease-out",
                transitionDelay: `${i * 0.08 + 0.8}s`,
              }}
            />
          )
        })}
      </g>

      {/* Central Nuqta (Diamond) - The Divine Origin */}
      <rect
        x={center - 3}
        y={center - 3}
        width={6}
        height={6}
        fill="url(#goldGradient)"
        transform={`rotate(45 ${center} ${center})`}
        opacity={mounted && animated ? 1 : 0}
        style={{
          transition: "opacity 0.5s ease-out",
          transitionDelay: "1.5s",
        }}
      />

      {/* Labels */}
      {showLabels && (
        <g
          opacity={mounted && animated ? 1 : 0}
          style={{ transition: "opacity 0.5s ease-out", transitionDelay: "1.8s" }}
        >
          <text x={center} y={size - 10} textAnchor="middle" fill="#C9A962" fontSize="10" fontFamily="Inter">
            The Seed of Life
          </text>
        </g>
      )}
    </svg>
  )
}
