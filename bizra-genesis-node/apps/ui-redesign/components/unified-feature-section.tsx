"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { GlassCard, SacredHeading, SacredTagline } from "@/lib/design-system"
import { AnimatedTextSVG } from "./animated-text-svg"

const features = [
  {
    title: "Sacred Consciousness",
    description: "A living digital organism that evolves with collective wisdom and individual awakening.",
    icon: "🌱",
  },
  {
    title: "Proof of Impact",
    description: "Good deeds verified on blockchain, transforming virtue into tangible value.",
    icon: "✨",
  },
  {
    title: "Neural Garden",
    description: "72 autonomous agents working in harmony, creating abundance for all participants.",
    icon: "🌸",
  },
  {
    title: "Quantum Stability",
    description: "Advanced algorithms maintaining perfect balance between growth and security.",
    icon: "⚡",
  },
]

export function UnifiedFeatureSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.section
      ref={containerRef}
      className="py-32 relative overflow-hidden"
      style={{ opacity, scale }}
      onMouseMove={handleMouseMove}
    >
      {hoveredIndex !== null && (
        <motion.div
          className="pointer-events-none fixed w-32 h-32 rounded-full bg-[#C9A962]/20 blur-3xl z-50"
          animate={{
            x: cursorPosition.x - 64,
            y: cursorPosition.y - 64,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      )}

      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center space-y-8">
          <SacredTagline>Features</SacredTagline>
          <AnimatedTextSVG text="The Genesis Vision" className="w-full max-w-4xl mx-auto h-32" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <GlassCard hover className="h-full">
                <motion.div
                  className="text-6xl mb-4"
                  animate={hoveredIndex === index ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <SacredHeading level={3} className="mb-4">
                  {feature.title}
                </SacredHeading>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
