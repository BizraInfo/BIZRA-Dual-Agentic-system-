"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Shield, Cpu, Eye, Zap, Lock, Sparkles } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function ProtocolSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".protocol-card",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".protocol-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )

      gsap.fromTo(
        ".metric-bar",
        { scaleX: 0, transformOrigin: "left" },
        {
          scaleX: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".metrics-container",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const protocols = [
    {
      icon: Cpu,
      title: "Graph-of-Thoughts",
      arabic: "رسم الأفكار",
      description: "State DAG with Merkle verification for cryptographically provable state transitions.",
    },
    {
      icon: Zap,
      title: "Sub-μs Events",
      arabic: "سرعة البرق",
      description: "Lock-free ring buffer achieving 250ns event propagation via SharedArrayBuffer.",
    },
    {
      icon: Eye,
      title: "Ihsan Rendering",
      arabic: "إحسان العرض",
      description: "144Hz constraint-driven WebGL with ethical compliance verification.",
    },
    {
      icon: Lock,
      title: "zk-SNARK Proofs",
      arabic: "إثبات الصفر",
      description: "Groth16 proofs for verifiable computation under 100ms generation.",
    },
    {
      icon: Sparkles,
      title: "AI Self-Optimization",
      arabic: "التحسين الذاتي",
      description: "DeepSeek-R1 integration for runtime code rewriting with safety constraints.",
    },
    {
      icon: Shield,
      title: "Proof-of-Impact",
      arabic: "إثبات الأثر",
      description: "Token minting for verifiable contributions with Harberger tax mechanics.",
    },
  ]

  const metrics = [
    { label: "Event Latency", value: "250ns", percentage: 99 },
    { label: "Frame Rate", value: "144Hz", percentage: 95 },
    { label: "Proof Generation", value: "<100ms", percentage: 92 },
    { label: "Ihsan Compliance", value: "0.99+", percentage: 99 },
  ]

  return (
    <section
      ref={sectionRef}
      id="protocol"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A1628 0%, #0F1E30 50%, #0A1628 100%)" }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#C9A962] to-transparent"
            style={{
              top: `${5 + i * 5}%`,
              left: 0,
              right: 0,
              animation: `scanLine ${3 + i * 0.2}s linear infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1 mb-6 text-xs font-mono tracking-[0.3em] text-[#C9A962]/60 uppercase border border-[#C9A962]/20 rounded-full">
            B-SIP Architecture
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            <span className="block text-[#C9A962]">The Protocol</span>
            <span
              className="block text-3xl md:text-4xl mt-4 text-[#C9A962]/60"
              style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}
            >
              بروتوكول السيادة
            </span>
          </h2>
          <p className="text-lg text-[#C9A962]/50 max-w-2xl mx-auto">
            Six pillars of sovereign computation. Each component cryptographically verified. Every pixel ethically
            constrained.
          </p>
        </div>

        {/* Protocol cards grid */}
        <div className="protocol-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {protocols.map((protocol, i) => (
            <div
              key={i}
              className="protocol-card group relative p-8 border border-[#C9A962]/20 bg-[#0A1628]/50 backdrop-blur-sm hover:border-[#C9A962]/40 transition-all duration-500"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#C9A962]/5 to-transparent" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 border border-[#C9A962]/30 bg-[#C9A962]/5">
                    <protocol.icon className="w-6 h-6 text-[#C9A962]" />
                  </div>
                  <span className="text-xl text-[#C9A962]/40" style={{ fontFamily: "var(--font-amiri), serif" }}>
                    {protocol.arabic}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-[#F9F1D8] mb-3">{protocol.title}</h3>
                <p className="text-sm text-[#C9A962]/60 leading-relaxed">{protocol.description}</p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A962]/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Performance metrics */}
        <div className="metrics-container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif text-[#C9A962]/80">Performance Benchmarks</h3>
            <p className="text-sm text-[#C9A962]/40 mt-2 font-mono">معايير الأداء</p>
          </div>

          <div className="space-y-6">
            {metrics.map((metric, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-mono text-[#C9A962]/60">{metric.label}</span>
                  <span className="text-sm font-mono text-[#C9A962]">{metric.value}</span>
                </div>
                <div className="h-2 bg-[#0A1628] border border-[#C9A962]/20 overflow-hidden">
                  <div
                    className="metric-bar h-full bg-gradient-to-r from-[#8A6B2E] via-[#C9A962] to-[#F9F1D8]"
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enter dashboard CTA */}
        <div className="mt-24 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-4 px-8 py-4 border border-[#C9A962] bg-gradient-to-r from-[#C9A962]/10 to-transparent hover:from-[#C9A962]/20 transition-all duration-500 group"
          >
            <span className="text-sm font-mono tracking-[0.2em] text-[#C9A962] uppercase">Access Full Dashboard</span>
            <svg
              className="w-5 h-5 text-[#C9A962] transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
