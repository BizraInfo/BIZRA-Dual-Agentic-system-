"use client"

import { useEffect, useRef } from "react"
import { SacredHeading, GlassCard, COLORS, FONTS } from "@/lib/design-system"

export function GenesisRules() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = document.querySelectorAll(".card-3d")

    const handleMouseMove = (e: MouseEvent, card: Element) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -5
      const rotateY = ((x - centerX) / centerX) * 5
      ;(card as HTMLElement).style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    }

    const handleMouseLeave = (card: Element) => {
      ;(card as HTMLElement).style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)"
    }

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => handleMouseMove(e as MouseEvent, card))
      card.addEventListener("mouseleave", () => handleMouseLeave(card))
    })
  }, [])

  return (
    <section
      id="rules"
      className="py-32 px-6 md:px-12 relative overflow-hidden"
      style={{ backgroundColor: COLORS.navy[900] }}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -right-64 w-[600px] h-[600px] border rounded-full animate-spin-slow"
          style={{ borderColor: `${COLORS.gold[500]}1A` }}
        ></div>
        <div
          className="absolute top-1/4 -right-64 w-[500px] h-[500px] border rounded-full animate-spin-reverse"
          style={{ borderColor: `${COLORS.gold[500]}1A` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <div>
            <SacredHeading level={2} className="mb-2">
              The Rules
            </SacredHeading>
            <div className={`${FONTS.arabic} text-3xl`} style={{ color: COLORS.gold[500] }}>
              القواعد الأساسية
            </div>
          </div>
          <div className="text-right mt-8 md:mt-0">
            <p className="text-white/50 max-w-sm">
              Everything operates by rules. In this zone, the heart is the scale of the mind, not the reverse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000">
          <GlassCard hover className="card-3d group preserve-3d">
            <div className="text-6xl font-bold text-white/5 mb-12 group-hover:text-gold-500/20 transition-colors">
              01
            </div>
            <h3 className={`text-xl ${FONTS.display} mb-4`} style={{ color: COLORS.gold[500] }}>
              The Heart Is The Scale
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              The intellect serves the heart. Logic serves wisdom. Technology serves humanity.
            </p>
          </GlassCard>

          <GlassCard
            hover
            className="md:col-span-2 card-3d group preserve-3d bg-gradient-to-br from-gold-900/20 to-transparent"
            style={{ borderColor: `${COLORS.gold[500]}33` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                style={{ color: COLORS.gold[500] }}
              >
                <g opacity="0.5">
                  <circle cx="50" cy="50" r="40" strokeWidth="0.5" />
                  <circle cx="50" cy="10" r="40" strokeWidth="0.5" />
                  <circle cx="85" cy="30" r="40" strokeWidth="0.5" />
                  <circle cx="85" cy="70" r="40" strokeWidth="0.5" />
                  <circle cx="50" cy="90" r="40" strokeWidth="0.5" />
                  <circle cx="15" cy="70" r="40" strokeWidth="0.5" />
                  <circle cx="15" cy="30" r="40" strokeWidth="0.5" />
                </g>
              </svg>
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="text-[#2A9D8F] uppercase tracking-widest text-xs">Core Principle</div>
              <div>
                <h3 className={`text-3xl ${FONTS.arabic} text-white mb-2`}>التوحيد</h3>
                <h4 className={`text-2xl ${FONTS.display}`} style={{ color: COLORS.gold[500] }}>
                  Oneness of Purpose
                </h4>
                <p className="text-white/70 mt-4 max-w-lg">
                  We build systems that recognize the unity of humanity. No silos. No exploitation. A universal resource
                  pool for 8 billion sovereigns.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover className="card-3d group preserve-3d">
            <div className="text-6xl font-bold text-white/5 mb-12 group-hover:text-gold-500/20 transition-colors">
              03
            </div>
            <h3 className={`text-xl ${FONTS.display} mb-4`} style={{ color: COLORS.gold[500] }}>
              Transparency
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              No false promises. No hidden layers. What you see is what governs. "I could not share everything, but I
              shared what matters."
            </p>
          </GlassCard>

          <GlassCard hover className="card-3d group preserve-3d">
            <div className="text-6xl font-bold text-white/5 mb-12 group-hover:text-gold-500/20 transition-colors">
              04
            </div>
            <h3 className={`text-xl ${FONTS.display} mb-4`} style={{ color: COLORS.gold[500] }}>
              For Humanity
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              This is not an individual project. This is the Ummah's project. Humanity's project. The Seed belongs to
              the soil.
            </p>
          </GlassCard>

          <GlassCard hover className="card-3d group flex flex-col justify-center items-center text-center preserve-3d">
            <div
              className="w-16 h-16 rounded-full border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
              style={{ borderColor: COLORS.gold[500] }}
            >
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className={`text-xl ${FONTS.display}`} style={{ color: COLORS.gold[500] }}>
              Proof of Impact
            </h3>
            <p className="text-white/50 text-xs mt-2 uppercase tracking-widest">Not Proof of Work</p>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
