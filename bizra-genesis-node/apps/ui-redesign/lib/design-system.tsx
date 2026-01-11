"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ReactNode, JSX } from "react"

// ============================================================================
// BIZRA DESIGN SYSTEM v2.0 ELITE
// Sacred Geometry • Genesis Gold • Celestial Navy
// ============================================================================

// COLORS - Direct from Brand Identity
export const COLORS = {
  gold: {
    100: "#F9F1D8",
    300: "#E6D5A6",
    400: "#D4B875",
    500: "#C9A962", // Genesis Gold (Primary)
    600: "#B08D45",
    900: "#8A6B2E",
  },
  navy: {
    800: "#0A1628", // Celestial Navy (Primary)
    900: "#050B14", // Deep Space
  },
  white: "#FFFFFF",
  black: "#000000",
} as const

// TYPOGRAPHY - Playfair Display + Inter + Amiri
export const FONTS = {
  display: "font-serif", // Playfair Display
  body: "font-sans", // Inter
  arabic: "font-arabic", // Amiri
} as const

// SPACING - Sacred Geometry Based (Fibonacci-inspired)
export const SPACING = {
  xs: "0.5rem", // 8px
  sm: "1rem", // 16px
  md: "1.618rem", // 26px (Golden Ratio)
  lg: "2.618rem", // 42px
  xl: "4.236rem", // 68px
  "2xl": "6.854rem", // 110px
} as const

// ============================================================================
// UNIFIED COMPONENTS
// ============================================================================

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-8 border border-white/5",
        "bg-white/[0.03] backdrop-blur-xl",
        hover && "transition-all duration-500 hover:border-gold-500/30 hover:bg-white/[0.05]",
        className,
      )}
      whileHover={hover ? { scale: 1.02 } : undefined}
    >
      {children}
    </motion.div>
  )
}

interface SacredButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SacredButton({ children, onClick, variant = "primary", size = "md", className }: SacredButtonProps) {
  const baseStyles =
    "relative overflow-hidden transition-all duration-500 font-sans uppercase tracking-[0.3em] rounded-lg"

  const variants = {
    primary:
      "bg-gradient-to-r from-gold-600 to-gold-500 text-navy-900 hover:shadow-[0_0_30px_rgba(201,169,98,0.5)] border border-gold-500",
    secondary: "border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 hover:border-gold-500",
    ghost: "text-white/70 hover:text-gold-500 hover:bg-white/5",
  }

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  }

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

interface SacredHeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4
  className?: string
  gradient?: boolean
}

export function SacredHeading({ children, level = 1, className, gradient = false }: SacredHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  const sizes = {
    1: "text-6xl md:text-8xl",
    2: "text-4xl md:text-6xl",
    3: "text-3xl md:text-4xl",
    4: "text-2xl md:text-3xl",
  }

  const baseStyles = cn(
    FONTS.display,
    "tracking-wider",
    gradient ? "text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-600" : "text-white",
  )

  return <Tag className={cn(sizes[level], baseStyles, className)}>{children}</Tag>
}

interface SacredTaglineProps {
  children: ReactNode
  className?: string
}

export function SacredTagline({ children, className }: SacredTaglineProps) {
  return (
    <div className={cn("text-gold-500 text-xs md:text-sm tracking-[0.4em] uppercase", FONTS.body, className)}>
      {children}
    </div>
  )
}

// Sacred Geometry Logo Component
export function SacredLogo({ size = "md", animate = false }: { size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-64 h-64",
  }

  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={cn(sizes[size])}
      initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: COLORS.gold[900], stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: COLORS.gold[500], stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: COLORS.gold[100], stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Seed of Life - 7 Circles */}
      <g transform="translate(100, 100)">
        {/* Center Circle */}
        <circle cx="0" cy="0" r="40" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" filter="url(#glow)" />

        {/* 6 Surrounding Circles */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 40
          const y = Math.sin(rad) * 40
          return (
            <circle key={i} cx={x} cy={y} r="40" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.8" />
          )
        })}

        {/* Central Nuqta (The Seed) */}
        <circle cx="0" cy="0" r="3" fill="url(#goldGrad)" filter="url(#glow)" />
      </g>
    </motion.svg>
  )
}

// Grid Background (Consistent across all pages)
export function SacredGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(201, 169, 98, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201, 169, 98, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)",
      }}
    />
  )
}

// Metric Display Component
interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function MetricCard({ label, value, unit, trend, className }: MetricCardProps) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-gold-500",
  }

  return (
    <GlassCard className={cn("flex flex-col gap-2", className)}>
      <SacredTagline>{label}</SacredTagline>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-4xl font-light", FONTS.body, trend ? trendColors[trend] : "text-white")}>
          {value}
        </span>
        {unit && <span className="text-white/40 text-sm">{unit}</span>}
      </div>
    </GlassCard>
  )
}
