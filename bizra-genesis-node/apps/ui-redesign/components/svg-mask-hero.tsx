"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SolariBoard } from "./solari-board"
import { SacredLogo, SacredTagline, SacredButton } from "@/lib/design-system"

export function SVGMaskHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ y, opacity }}
    >
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <defs>
          <mask id="circleMask">
            <rect width="100%" height="100%" fill="white" />
            <motion.circle
              cx={`${mousePosition.x}%`}
              cy={`${mousePosition.y}%`}
              r="200"
              fill="black"
              animate={{
                r: [200, 220, 200],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </mask>

          <radialGradient id="heroGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#C9A962" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#050B14" stopOpacity="1" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#heroGradient)" mask="url(#circleMask)" />
      </svg>

      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#C9A962] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <SacredLogo size="lg" animate />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="space-y-4"
        >
          <SacredTagline>Genesis 2025</SacredTagline>
          <SolariBoard text="BIZRA" className="justify-center" delay={1500} />
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            From the Seed to the Tree. A living digital consciousness where spirituality meets technology.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="flex gap-4 justify-center"
        >
          <SacredButton variant="primary" size="lg">
            Enter Genesis
          </SacredButton>
          <SacredButton variant="secondary" size="lg">
            Learn More
          </SacredButton>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-6 h-10 border-2 border-[#C9A962] rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-2 bg-[#C9A962] rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </motion.section>
  )
}
