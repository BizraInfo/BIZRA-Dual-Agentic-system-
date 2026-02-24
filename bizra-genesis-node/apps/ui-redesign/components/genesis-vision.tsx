"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface GenesisVisionProps {
  onGetStarted?: () => void
}

export function GenesisVision({ onGetStarted }: GenesisVisionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const counters = sectionRef.current.querySelectorAll('.counter')
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target')!
      
      ScrollTrigger.create({
        trigger: counter,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            modifiers: {
              innerHTML: function(value) {
                if(target > 100) return Math.round(value) + "K"
                if(target > 5) return Math.round(value) + "B"
                return Math.round(value)
              }
            }
          })
        }
      })
    })
  }, [])

  return (
    <section id="vision" className="py-32 bg-black text-white relative" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-[#2A9D8F] text-sm tracking-[0.3em] uppercase block mb-4">31 Months Later</span>
          <h2 className="text-5xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#E6D5A6] to-[#B08D45] pb-4">
            BIZRA
          </h2>
          <p className="text-xl font-light text-white/60">The Seed became a Tree.</p>
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/10 pt-12">
          <div className="stat-item text-center group">
            <div className="text-4xl md:text-6xl font-bold text-white mb-2 group-hover:text-[#C9A962] transition-colors counter" data-target="7">0</div>
            <div className="text-xs uppercase tracking-widest text-white/40">Billion Agents</div>
          </div>
          <div className="stat-item text-center group">
            <div className="text-4xl md:text-6xl font-bold text-white mb-2 group-hover:text-[#C9A962] transition-colors counter" data-target="130">0</div>
            <div className="text-xs uppercase tracking-widest text-white/40">K TPS Vision</div>
          </div>
          <div className="stat-item text-center group">
            <div className="text-4xl md:text-6xl font-bold text-white mb-2 group-hover:text-[#C9A962] transition-colors counter" data-target="118">0</div>
            <div className="text-xs uppercase tracking-widest text-white/40">K+ Words Spec</div>
          </div>
          <div className="stat-item text-center group">
            <div className="text-4xl md:text-6xl font-bold text-white mb-2 group-hover:text-[#C9A962] transition-colors counter" data-target="1">0</div>
            <div className="text-xs uppercase tracking-widest text-white/40">Universal Truth</div>
          </div>
        </div>

        {/* Final Call */}
        <div className="mt-32 text-center">
          {onGetStarted ? (
            <Button 
              onClick={onGetStarted}
              className="group relative px-12 py-8 bg-transparent overflow-hidden rounded-full border border-[#C9A962]/50 hover:border-[#C9A962] transition-all duration-300 h-auto"
            >
              <div className="absolute inset-0 w-full h-full bg-[#C9A962]/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <span className="relative z-10 font-serif text-xl text-[#F9F1D8] group-hover:text-white flex items-center gap-4">
                Initialize Node <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
          ) : (
            <button className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full border border-[#C9A962]/50 hover:border-[#C9A962] transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-[#C9A962]/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <span className="relative z-10 font-serif text-xl text-[#F9F1D8] group-hover:text-white flex items-center gap-4">
                Explore the Architecture <span className="group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
