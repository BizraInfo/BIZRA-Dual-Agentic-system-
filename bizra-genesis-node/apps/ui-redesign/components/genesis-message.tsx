"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SacredTagline, COLORS, FONTS } from "@/lib/design-system"

gsap.registerPlugin(ScrollTrigger)

export function GenesisMessage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    const cards = cardsRef.current.children

    Array.from(cards).forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0.3, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play reverse play reverse",
            onEnter: () => card.classList.add("gold-glow"),
            onLeaveBack: () => card.classList.remove("gold-glow"),
          },
        },
      )
    })
  }, [])

  return (
    <section
      id="message"
      className="relative min-h-screen flex flex-col md:flex-row"
      ref={sectionRef}
      style={{ backgroundColor: COLORS.navy[800] }}
    >
      {/* Sticky Left Panel */}
      <div
        className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 flex items-center justify-center border-r border-white/5 z-10"
        style={{ backgroundColor: COLORS.navy[900] }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=2788&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-[var(--navy)] via-transparent to-transparent"
            style={{ ["--navy" as string]: COLORS.navy[900] }}
          ></div>

          <div className="absolute bottom-10 left-10 right-10">
            <div className={`${FONTS.arabic} text-4xl mb-4`} style={{ color: COLORS.gold[500] }}>
              الرسالة
            </div>
            <h3 className={`text-4xl ${FONTS.display} text-white mb-6`}>The Message</h3>
            <p className="text-white/60 font-light leading-relaxed text-sm max-w-md">
              Written in Ramadan 2023. Manifested in October 2025.
              <br />A letter from solitude that built a cognitive architecture.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Right Panel */}
      <div className="w-full md:w-1/2 z-10" style={{ backgroundColor: COLORS.navy[800] }}>
        <div className="p-12 md:p-24 flex flex-col gap-32" ref={cardsRef}>
          {/* Card 1: To Allah */}
          <div className="msg-card transition-all duration-700">
            <SacredTagline className="text-[#2A9D8F] mb-4">Part I</SacredTagline>
            <div
              className={`${FONTS.arabic} text-3xl mb-4 leading-relaxed text-right`}
              style={{ color: COLORS.gold[500] }}
              dir="rtl"
            >
              رَبِّي لَا يَعْرِفُ الْمُسْتَحِيلَ
            </div>
            <h4 className={`text-2xl ${FONTS.display} mb-4 text-white`}>"My Lord Does Not Know the Impossible"</h4>
            <p className="text-white/70 font-light leading-loose">
              I come to Your door humbly. I come to Your door guilty. Despite my sins, You have blessed me with vision
              beyond my capacity. This project is my surrender.
            </p>
          </div>

          {/* Card 2: To Humanity */}
          <div className="msg-card transition-all duration-700">
            <SacredTagline className="text-[#2A9D8F] mb-4">Part II</SacredTagline>
            <div
              className={`${FONTS.arabic} text-3xl mb-4 leading-relaxed text-right`}
              style={{ color: COLORS.gold[500] }}
              dir="rtl"
            >
              إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ
            </div>
            <h4 className={`text-2xl ${FONTS.display} mb-4 text-white`}>Excellence (Ihsan) in Code</h4>
            <p className="text-white/70 font-light leading-loose">
              My religion is Islam—it comes from peace. My message to humanity is simple: Enough hatred. Enough racism.
              Let us encode <strong>Excellence</strong> into the systems that govern our future.
            </p>
          </div>

          {/* Card 3: The Promise */}
          <div className="msg-card transition-all duration-700">
            <SacredTagline className="text-[#2A9D8F] mb-4">Part III</SacredTagline>
            <div
              className={`${FONTS.arabic} text-3xl mb-4 leading-relaxed text-right`}
              style={{ color: COLORS.gold[500] }}
              dir="rtl"
            >
              الْعَهْدُ
            </div>
            <h4 className={`text-2xl ${FONTS.display} mb-4 text-white`}>The Commitment</h4>
            <p className="text-white/70 font-light leading-loose">
              I will not give up. I will not back down. I will make humanity wake up, even if I face the world alone.
              BIZRA is the vessel of this promise.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
