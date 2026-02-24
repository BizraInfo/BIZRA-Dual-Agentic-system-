"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SolariBoardProps {
  text: string
  className?: string
  delay?: number
}

export function SolariBoard({ text, className, delay = 0 }: SolariBoardProps) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const characters = text.split("")
    let currentIndex = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < characters.length) {
          setDisplayText((prev) => prev + characters[currentIndex])
          currentIndex++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, 80) // Flap speed

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, delay])

  return (
    <div className={cn("inline-flex flex-wrap gap-1 perspective-1000", className)}>
      {text.split(" ").map((word, wordIndex) => (
        <div key={wordIndex} className="inline-flex gap-1">
          {word.split("").map((char, charIndex) => {
            const globalIndex =
              text.split(" ").slice(0, wordIndex).join(" ").length + (wordIndex > 0 ? wordIndex : 0) + charIndex
            const isRevealed = displayText.length > globalIndex

            return (
              <motion.div
                key={charIndex}
                className="relative overflow-hidden"
                initial={{ rotateX: -90 }}
                animate={{
                  rotateX: isRevealed ? 0 : -90,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={cn(
                    "px-2 py-1 bg-[#0A1628] border border-[#C9A962]/30 rounded",
                    "font-serif text-4xl md:text-6xl lg:text-7xl text-[#C9A962]",
                    "shadow-[0_0_20px_rgba(201,169,98,0.3)]",
                  )}
                >
                  {char}
                </div>
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
