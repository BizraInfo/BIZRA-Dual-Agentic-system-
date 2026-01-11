"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from 'lucide-react'

export function OnboardingJourney({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  
  const steps = [
    {
      title: "The Awakening",
      description: "You are entering a space where technology meets consciousness. BIZRA is not just a platform; it is a living neural network.",
      icon: "✧"
    },
    {
      title: "The Connection",
      description: "72 specialized AI agents are waiting to connect with your unique frequency. Together, you will co-create value.",
      icon: "☤"
    },
    {
      title: "The Structure",
      description: "Built on sacred geometry and quantum-resistant cryptography. Your data is secure, your impact is verified.",
      icon: "⌬"
    },
    {
      title: "The Mission",
      description: "To elevate global consciousness through decentralized collaboration. Wealth is a byproduct of wisdom.",
      icon: "∞"
    },
    {
      title: "Begin Journey",
      description: "Your node is ready. Initialize connection to the BIZRA grid.",
      icon: "⚡"
    }
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#050B14] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="w-24 h-24 rounded-full border border-[#C9A962]/30 flex items-center justify-center text-4xl text-[#C9A962] bg-[#C9A962]/5 shadow-[0_0_30px_rgba(201,169,98,0.1)]">
              {steps[step].icon}
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-[#F8F6F1]">{steps[step].title}</h2>
              <p className="text-xl text-[#8892b0] max-w-lg mx-auto leading-relaxed">
                {steps[step].description}
              </p>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4">
              <Button 
                onClick={handleNext}
                className="bg-[#C9A962] hover:bg-[#B08D45] text-[#050B14] px-8 py-6 text-lg rounded-full group"
              >
                {step === steps.length - 1 ? "Enter BIZRA" : "Continue"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex gap-2 mt-4">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      i === step ? "bg-[#C9A962]" : "bg-[#C9A962]/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
