"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"

export function CinematicLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0) // 0: Awakening, 1: Coherence, 2: Synchronization

  const stages = [
    "Awakening Neural Pathways...",
    "Establishing Quantum Coherence...",
    "Synchronizing 72-Agent Grid..."
  ]

  useEffect(() => {
    // Progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 0.5
      })
    }, 30)

    // Stage transitions
    const stageInterval = setInterval(() => {
      setStage(prev => (prev < 2 ? prev + 1 : prev))
    }, 2000)

    // Completion
    const timeout = setTimeout(() => {
      onComplete()
    }, 7000) // 7 seconds total load time

    return () => {
      clearInterval(interval)
      clearInterval(stageInterval)
      clearTimeout(timeout)
    }
  }, [onComplete])

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#050B14] flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
    >
      {/* Sacred Geometry Background Animation (Simplified for performance) */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#C9A962]/20 rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#C9A962]/30 rounded-full animate-reverse-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#C9A962]/40 rounded-full animate-pulse" />
      </div>

      {/* Central Logo Construction */}
      <div className="relative z-10 mb-12">
        <svg width="120" height="120" viewBox="0 0 100 100" className="text-[#C9A962]">
          <motion.g 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            <path d="M50 10 Q70 30 50 50 Q30 30 50 10" />
            <path d="M50 90 Q70 70 50 50 Q30 70 50 90" />
            <path d="M84.6 30 Q67.3 40 50 50 Q67.3 60 84.6 50" />
            <path d="M15.4 70 Q32.7 60 50 50 Q32.7 40 15.4 50" />
            <path d="M84.6 70 Q67.3 60 50 50 Q67.3 60 84.6 30" />
            <path d="M15.4 30 Q32.7 40 50 50 Q32.7 60 15.4 70" />
          </motion.g>
        </svg>
      </div>

      {/* Text & Progress */}
      <div className="z-10 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-serif text-[#F8F6F1] tracking-[0.2em]">BIZRA</h1>
        
        <div className="h-[1px] w-64 bg-[#C9A962]/20 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-[#C9A962]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[#8892b0] font-mono text-xs tracking-widest uppercase"
          >
            {stages[stage]}
          </motion.p>
        </AnimatePresence>
        
        <p className="text-[#C9A962] font-mono text-xs mt-2">{Math.round(progress)}%</p>
      </div>
    </motion.div>
  )
}
