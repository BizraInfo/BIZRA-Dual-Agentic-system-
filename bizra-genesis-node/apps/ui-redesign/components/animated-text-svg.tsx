"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface AnimatedTextSVGProps {
  text: string
  className?: string
}

export function AnimatedTextSVG({ text, className }: AnimatedTextSVGProps) {
  const textRef = useRef<SVGTextElement>(null)
  const isInView = useInView(textRef, { once: true })

  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 3,
        ease: "easeInOut",
      },
    },
  }

  return (
    <svg className={className} viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#C9A962", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#F9F1D8", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#C9A962", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      <motion.text
        ref={textRef}
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="none"
        stroke="url(#textGradient)"
        strokeWidth="2"
        fontSize="80"
        fontFamily="Playfair Display, serif"
        className="font-serif"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={pathVariants}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 0,
        }}
      >
        {text}
      </motion.text>
    </svg>
  )
}
