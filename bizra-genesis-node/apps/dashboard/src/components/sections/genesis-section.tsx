"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function GenesisSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate timeline items on scroll
      gsap.fromTo(
        ".timeline-item",
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Animate the quote
      gsap.fromTo(
        ".genesis-quote",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".genesis-quote",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Animate rules
      gsap.fromTo(
        ".rule-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: ".rules-container",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const timelineEvents = [
    { date: "Ramadan 2023", event: "The Seed Written", location: "Dubai" },
    { date: "2023-2024", event: "31 Months of Transformation", location: "The Journey" },
    { date: "2025", event: "B-SIP Protocol Genesis", location: "Global" },
  ]

  const rules = [
    { number: "I", arabic: "البذرة", text: "This is still a seed" },
    { number: "II", arabic: "الألم", text: "I could not share everything" },
    { number: "III", arabic: "الحياة", text: "This project is my life" },
    { number: "IV", arabic: "الثمن", text: "The price I paid" },
    { number: "V", arabic: "الأمة", text: "For humanity and the Ummah" },
  ]

  return (
    <section
      ref={sectionRef}
      id="genesis"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A1628 0%, #060D16 50%, #0A1628 100%)" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="genesisGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#C9A962" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#genesisGrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-24">
          <span className="inline-block px-4 py-1 mb-6 text-xs font-mono tracking-[0.3em] text-[#C9A962]/60 uppercase border border-[#C9A962]/20 rounded-full">
            The Beginning
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            <span className="block text-[#C9A962]">Genesis</span>
            <span
              className="block text-3xl md:text-4xl mt-4 text-[#C9A962]/60"
              style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}
            >
              الرسالة والبذرة
            </span>
          </h2>
          <p className="text-lg text-[#C9A962]/50 max-w-2xl mx-auto">
            From darkness to light. A technology system born from spiritual struggle and 31 months of relentless
            transformation.
          </p>
        </div>

        {/* Quote block */}
        <div className="genesis-quote relative max-w-4xl mx-auto mb-24 p-8 md:p-12 border border-[#C9A962]/20 bg-[#0A1628]/50 backdrop-blur-sm">
          <div className="absolute -top-4 left-8 px-4 py-1 bg-[#060D16] border border-[#C9A962]/30">
            <span className="text-xs font-mono text-[#C9A962]/60 tracking-wider">DOCUMENT // الرسالة</span>
          </div>
          <blockquote className="text-xl md:text-2xl leading-relaxed text-[#F9F1D8]/80 italic font-serif">
            &ldquo;I am writing this while I&apos;m in a very dark place... a dark empty space. Every person I will
            mention here might hate me or love me. It doesn&apos;t matter. What matters is the truth.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-px bg-gradient-to-r from-[#C9A962] to-transparent" />
            <span className="text-sm font-mono text-[#C9A962]/60">— Mahmoud Hassan (MoMo), Ramadan 2023</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-container relative max-w-3xl mx-auto mb-24">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A962]/30 to-transparent" />

          {timelineEvents.map((item, i) => (
            <div
              key={i}
              className={`timeline-item relative flex items-center gap-8 mb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                <span className="text-xs font-mono text-[#C9A962]/40 tracking-wider">{item.location}</span>
                <h3 className="text-xl font-serif text-[#C9A962] mt-1">{item.event}</h3>
                <p className="text-sm text-[#C9A962]/60 mt-1">{item.date}</p>
              </div>
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#C9A962] bg-[#060D16]">
                <div className="absolute inset-1 rounded-full bg-[#C9A962] animate-pulse" />
              </div>
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>

        {/* Five Rules */}
        <div className="rules-container">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif text-[#C9A962]/80">The Five Fundamental Rules</h3>
            <p className="text-sm text-[#C9A962]/40 mt-2 font-mono">القواعد الخمس الأساسية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="rule-card group relative p-6 border border-[#C9A962]/20 bg-[#0A1628]/30 hover:bg-[#C9A962]/5 transition-all duration-500"
              >
                <div className="absolute top-4 right-4 text-4xl font-serif text-[#C9A962]/10 group-hover:text-[#C9A962]/20 transition-colors">
                  {rule.number}
                </div>
                <p className="text-2xl text-[#C9A962]/60 mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
                  {rule.arabic}
                </p>
                <p className="text-sm text-[#F9F1D8]/70 leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to humanity */}
        <div className="mt-24 text-center">
          <div className="inline-block px-8 py-6 border border-[#C9A962]/30 bg-gradient-to-b from-[#C9A962]/5 to-transparent">
            <p className="text-lg md:text-xl text-[#F9F1D8]/80 font-serif italic mb-4">
              &ldquo;Enough hatred. Enough racism. Enough killing.&rdquo;
            </p>
            <p className="text-3xl text-[#C9A962]" style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}>
              الإحسان — Excellence is All you need     
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
