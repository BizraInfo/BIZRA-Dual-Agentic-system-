"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * BIZRA Unified Design System
 * Single source of truth for all visual elements
 * Ensuring 100% brand consistency across every component
 */

// ==================== COLOR TOKENS ====================
export const BIZRA_COLORS = {
  // Primary Brand Colors
  genesis: {
    gold: "#C9A962", // Primary gold
    goldLight: "#D4B976", // Lighter gold for hover
    goldDark: "#B89647", // Darker gold for active
  },
  celestial: {
    navy: "#050B14", // Deep navy background
    navyMid: "#0A1628", // Mid navy for cards
    navyLight: "#1A2B42", // Light navy for borders
  },
  sacred: {
    teal: "#2A9D8F", // Accent teal
    cream: "#F8F6F1", // Text/foreground
  },
  // Status Colors
  status: {
    active: "#10B981", // Green
    processing: "#F59E0B", // Amber
    idle: "#6B7280", // Gray
    error: "#EF4444", // Red
  },
} as const

// ==================== TYPOGRAPHY SCALE ====================
export const BIZRA_TYPOGRAPHY = {
  display: "font-playfair text-5xl md:text-7xl font-bold",
  h1: "font-playfair text-4xl md:text-6xl font-bold",
  h2: "font-playfair text-3xl md:text-5xl font-bold",
  h3: "font-playfair text-2xl md:text-4xl font-semibold",
  h4: "font-playfair text-xl md:text-2xl font-semibold",
  body: "font-sans text-base md:text-lg leading-relaxed",
  bodySmall: "font-sans text-sm md:text-base leading-relaxed",
  caption: "font-sans text-xs md:text-sm",
  arabic: "font-arabic text-base md:text-lg",
  mono: "font-mono text-sm",
} as const

// ==================== SPACING SCALE ====================
export const BIZRA_SPACING = {
  section: "py-20 md:py-32",
  container: "container mx-auto px-4 md:px-6 lg:px-8",
  cardPadding: "p-6 md:p-8",
  buttonPadding: "px-6 md:px-8 py-3 md:py-4",
} as const

// ==================== UNIFIED COMPONENTS ====================

interface BIZRAHeadingProps {
  children: React.ReactNode
  level?: "display" | "h1" | "h2" | "h3" | "h4"
  className?: string
  animate?: boolean
}

export const BIZRAHeading: React.FC<BIZRAHeadingProps> = ({ children, level = "h2", className, animate = true }) => {
  const Component = animate ? motion.h2 : "h2"

  return (
    <Component
      className={cn(
        BIZRA_TYPOGRAPHY[level],
        "bg-gradient-to-r from-[#C9A962] via-[#D4B976] to-[#C9A962] bg-clip-text text-transparent",
        className,
      )}
      {...(animate && {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
      })}
    >
      {children}
    </Component>
  )
}

interface BIZRATextProps {
  children: React.ReactNode
  variant?: "body" | "bodySmall" | "caption" | "arabic" | "mono"
  className?: string
  muted?: boolean
}

export const BIZRAText: React.FC<BIZRATextProps> = ({ children, variant = "body", className, muted = false }) => {
  return (
    <p className={cn(BIZRA_TYPOGRAPHY[variant], muted ? "text-[#F8F6F1]/70" : "text-[#F8F6F1]", className)}>
      {children}
    </p>
  )
}

interface BIZRACardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export const BIZRACard: React.FC<BIZRACardProps> = ({ children, className, hover = true, glow = false }) => {
  return (
    <motion.div
      className={cn(
        "bg-[#0A1628]/60 backdrop-blur-xl",
        "border border-[#C9A962]/20",
        "rounded-xl",
        BIZRA_SPACING.cardPadding,
        hover && "hover:border-[#C9A962]/40 hover:bg-[#0A1628]/80 transition-all duration-300",
        glow && "shadow-[0_0_30px_rgba(201,169,98,0.15)]",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

interface BIZRAButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export const BIZRAButton: React.FC<BIZRAButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
  disabled = false,
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#C9A962] to-[#D4B976] text-[#050B14] hover:from-[#D4B976] hover:to-[#C9A962] shadow-lg shadow-[#C9A962]/25",
    secondary: "bg-[#0A1628] text-[#C9A962] border border-[#C9A962]/30 hover:bg-[#1A2B42] hover:border-[#C9A962]/60",
    outline: "bg-transparent text-[#C9A962] border border-[#C9A962]/40 hover:bg-[#C9A962]/10",
    ghost: "bg-transparent text-[#C9A962] hover:bg-[#C9A962]/10",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-semibold rounded-full transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  )
}

interface BIZRABadgeProps {
  children: React.ReactNode
  variant?: "active" | "processing" | "idle" | "error"
  className?: string
}

export const BIZRABadge: React.FC<BIZRABadgeProps> = ({ children, variant = "active", className }) => {
  const variants = {
    active: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
    processing: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    idle: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/30",
    error: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

interface BIZRASectionProps {
  children: React.ReactNode
  className?: string
  background?: "default" | "gradient" | "mesh"
}

export const BIZRASection: React.FC<BIZRASectionProps> = ({ children, className, background = "default" }) => {
  const backgrounds = {
    default: "bg-[#050B14]",
    gradient: "bg-gradient-to-br from-[#050B14] via-[#0A1628] to-[#050B14]",
    mesh: "bg-[#050B14] relative overflow-hidden",
  }

  return (
    <section className={cn(BIZRA_SPACING.section, backgrounds[background], "relative", className)}>
      {background === "mesh" && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,98,0.1),transparent_50%)]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(201,169,98,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,98,0.05) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      )}
      <div className={BIZRA_SPACING.container}>{children}</div>
    </section>
  )
}

// ==================== SACRED GEOMETRY LOGO ====================
export const BIZRALogo: React.FC<{ size?: number; animate?: boolean; className?: string }> = ({
  size = 100,
  animate = true,
  className,
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-[#C9A962]", className)}
      initial={animate ? { opacity: 0, rotate: -180 } : {}}
      animate={animate ? { opacity: 1, rotate: 0 } : {}}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {/* Flower of Life petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <circle
          key={angle}
          cx={50 + 25 * Math.cos((angle * Math.PI) / 180)}
          cy={50 + 25 * Math.sin((angle * Math.PI) / 180)}
          r="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
      ))}

      {/* Center circle */}
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />

      {/* Inner sacred point */}
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </motion.svg>
  )
}

// ==================== PROGRESS BAR ====================
export const BIZRAProgress: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  return (
    <div className={cn("w-full h-2 bg-[#0A1628] rounded-full overflow-hidden", className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-[#C9A962] to-[#D4B976]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  )
}

// ==================== DIVIDER ====================
export const BIZRADivider: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("w-full h-px bg-gradient-to-r from-transparent via-[#C9A962]/30 to-transparent", className)} />
  )
}
