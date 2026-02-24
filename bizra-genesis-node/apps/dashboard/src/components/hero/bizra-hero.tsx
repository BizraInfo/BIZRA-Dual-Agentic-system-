"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { gsap } from "gsap"

export function BizraHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<SVGSVGElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const seedRef = useRef<SVGGElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const particles = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: 10 + ((i * 1.8) % 80),
        top: 5 + ((i * 2.3) % 90),
        size: 1 + (i % 4),
        opacity: 0.2 + (i % 5) * 0.1,
        blur: 5 + (i % 10),
      })),
    [],
  )

  useEffect(() => {
    setIsLoaded(true)

    const ctx = gsap.context(() => {
      const masterTL = gsap.timeline({ delay: 0.2 })

      masterTL.fromTo(
        ".mask-circle-center",
        { scale: 0, transformOrigin: "center center" },
        { scale: 1, duration: 1.2, ease: "power3.out" },
      )

      masterTL.fromTo(
        ".mask-circle-outer",
        { scale: 0, opacity: 0, transformOrigin: "center center" },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: { amount: 0.6, from: "random" },
          ease: "back.out(1.7)",
        },
        "-=0.6",
      )

      masterTL.fromTo(
        ".mask-petal",
        { scale: 0, opacity: 0, rotation: -60 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.08,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.4",
      )

      masterTL.fromTo(
        ".hex-frame",
        { strokeDashoffset: 2000, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.5, ease: "power2.inOut" },
        "-=0.8",
      )

      masterTL.fromTo(
        ".hero-title-char",
        { y: 100, opacity: 0, rotationX: -90 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: "power4.out",
        },
        "-=0.5",
      )

      masterTL.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "-=0.3",
      )

      masterTL.fromTo(
        ".cta-button",
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.5)" },
        "-=0.2",
      )

      masterTL.fromTo(
        ".particle",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: { amount: 1, from: "random" },
          ease: "power2.out",
        },
        "-=1",
      )

      gsap.to(".particle", {
        y: "random(-30, 30)",
        x: "random(-20, 20)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 2, from: "random" },
      })

      gsap.to(seedRef.current, {
        rotation: 360,
        duration: 120,
        repeat: -1,
        ease: "none",
      })

      gsap.to(".center-glow", {
        opacity: 0.6,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const titleText = "BIZRA"
  const subtitleText = "Sovereign Interface Protocol"

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060D16 0%, #0A1628 50%, #0F1E30 100%)" }}
    >
      {/* Video background layer */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          poster="/abstract-dark-blue-cosmic-nebula.jpg"
        >
          <source src="/abstract-flowing-particles-dark.jpg" type="video/mp4" />
        </video>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060D16]/80 via-[#0A1628]/60 to-[#0A1628]/90" />
      </div>

      {/* SVG Mask Definition */}
      <svg
        ref={maskRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <mask id="seedMask">
            <rect width="100%" height="100%" fill="black" />
            <g ref={seedRef} transform="translate(960, 540)">
              <circle className="mask-circle-center" cx="0" cy="0" r="300" fill="white" />
              {Array.from({ length: 6 }, (_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180)
                const x = 200 * Math.cos(angle)
                const y = 200 * Math.sin(angle)
                return <circle key={i} className="mask-circle-outer" cx={x} cy={y} r="200" fill="white" />
              })}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = i * 30 * (Math.PI / 180)
                const length = 250
                const x = length * Math.cos(angle)
                const y = length * Math.sin(angle)
                return (
                  <ellipse
                    key={`petal-${i}`}
                    className="mask-petal"
                    cx={x * 0.5}
                    cy={y * 0.5}
                    rx="40"
                    ry="120"
                    fill="white"
                    transform={`rotate(${i * 30})`}
                    style={{ transformOrigin: "0 0" }}
                  />
                )
              })}
            </g>
            <rect x="0" y="800" width="1920" height="280" fill="white" opacity="0.3" />
          </mask>

          <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0.5 0 0 0 0.8  0 0.4 0 0 0.66  0 0 0.2 0 0.38  0 0 0 1 0"
              result="goldBlur"
            />
            <feMerge>
              <feMergeNode in="goldBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="heroGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A6B2E" />
            <stop offset="30%" stopColor="#C9A962" />
            <stop offset="50%" stopColor="#F9F1D8" />
            <stop offset="70%" stopColor="#C9A962" />
            <stop offset="100%" stopColor="#8A6B2E" />
          </linearGradient>
        </defs>

        <g transform="translate(960, 540)">
          <polygon
            className="hex-frame"
            points="0,-450 390,-225 390,225 0,450 -390,225 -390,-225"
            fill="none"
            stroke="url(#heroGoldGradient)"
            strokeWidth="1"
            strokeDasharray="2000"
            opacity="0"
          />
          <polygon
            className="hex-frame"
            points="0,-480 415,-240 415,240 0,480 -415,240 -415,-240"
            fill="none"
            stroke="#C9A962"
            strokeWidth="0.5"
            strokeDasharray="2000"
            opacity="0"
          />
        </g>

        <circle
          className="center-glow"
          cx="960"
          cy="540"
          r="150"
          fill="url(#heroGoldGradient)"
          opacity="0.3"
          filter="url(#heroGlow)"
        />
      </svg>

      {/* Floating particles - now using memoized values */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `rgba(201, 169, 98, ${p.opacity})`,
              boxShadow: `0 0 ${p.blur}px rgba(201, 169, 98, 0.3)`,
            }}
          />
        ))}
      </div>

      {/* Geometric lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * 30 * (Math.PI / 180)
          const x2 = 960 + 1000 * Math.cos(angle)
          const y2 = 540 + 1000 * Math.sin(angle)
          return (
            <line
              key={i}
              x1="960"
              y1="540"
              x2={x2}
              y2={y2}
              stroke="#C9A962"
              strokeWidth="0.5"
              strokeDasharray="5 10"
              opacity="0.3"
            />
          )
        })}
      </svg>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Seed of Life background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <svg width="900" height="900" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="seedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A962" />
                <stop offset="100%" stopColor="#F9F1D8" />
              </linearGradient>
            </defs>
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="40" fill="none" stroke="url(#seedGradient)" strokeWidth="0.5" />
              {Array.from({ length: 6 }, (_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180)
                return (
                  <circle
                    key={i}
                    cx={40 * Math.cos(angle)}
                    cy={40 * Math.sin(angle)}
                    r="40"
                    fill="none"
                    stroke="url(#seedGradient)"
                    strokeWidth="0.5"
                  />
                )
              })}
            </g>
          </svg>
        </div>

        {/* Pre-title badge */}
        <div
          className="mb-8 px-4 py-1.5 rounded-full border border-[#C9A962]/30 bg-[#C9A962]/5 backdrop-blur-sm opacity-0"
          style={{ animation: isLoaded ? "fadeIn 0.8s ease-out 1.8s forwards" : "none" }}
        >
          <span className="text-xs font-mono tracking-[0.3em] text-[#C9A962] uppercase">
            Genesis Epoch // 2023-2025
          </span>
        </div>

        {/* Main title */}
        <h1
          ref={titleRef}
          className="text-[clamp(4rem,15vw,12rem)] font-serif font-bold leading-none mb-6"
          style={{ perspective: "1000px" }}
        >
          <span className="sr-only">{titleText}</span>
          <span aria-hidden="true" className="flex justify-center overflow-hidden">
            {titleText.split("").map((char, i) => (
              <span
                key={i}
                className="hero-title-char inline-block"
                style={{
                  background: "linear-gradient(180deg, #F9F1D8 0%, #C9A962 50%, #8A6B2E 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 0 60px rgba(201, 169, 98, 0.5)",
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>

        {/* Arabic text */}
        <p
          className="text-3xl md:text-4xl text-[#C9A962]/80 mb-4"
          style={{
            fontFamily: "var(--font-amiri), serif",
            direction: "rtl",
            opacity: 0,
            animation: isLoaded ? "fadeIn 0.8s ease-out 2s forwards" : "none",
          }}
        >
          بذرة الحياة
        </p>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl font-light tracking-[0.2em] text-[#C9A962]/70 uppercase mb-12 max-w-2xl"
        >
          {subtitleText}
        </p>

        {/* Ihsan badge */}
        <div
          className="flex items-center gap-3 mb-12 opacity-0"
          style={{ animation: isLoaded ? "fadeIn 0.8s ease-out 2.2s forwards" : "none" }}
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A962]/50" />
          <span className="text-sm font-mono text-[#C9A962]/60 tracking-wider">الإحسان • Al-Ihsan • Excellence</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A962]/50" />
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
          <a
            href="#protocol"
            className="cta-button group relative px-8 py-4 overflow-hidden rounded-sm border border-[#C9A962] bg-transparent transition-all duration-500 hover:bg-[#C9A962]/10"
          >
            <span className="relative z-10 text-sm font-mono tracking-[0.2em] text-[#C9A962] uppercase transition-colors group-hover:text-[#F9F1D8]">
              Enter Protocol
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#C9A962]/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>

          <a
            href="#genesis"
            className="cta-button group relative px-8 py-4 overflow-hidden rounded-sm bg-gradient-to-r from-[#8A6B2E] via-[#C9A962] to-[#8A6B2E] transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,169,98,0.4)]"
          >
            <span className="relative z-10 text-sm font-mono tracking-[0.2em] text-[#0A1628] uppercase font-semibold">
              Genesis Story
            </span>
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
          style={{ animation: isLoaded ? "fadeIn 0.8s ease-out 2.5s forwards" : "none" }}
        >
          <span className="text-xs font-mono text-[#C9A962]/40 tracking-wider">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#C9A962]/40 to-transparent relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-4 bg-[#C9A962]"
              style={{ animation: "scrollPulse 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-24 h-24 opacity-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L40 0 L40 5 L5 5 L5 40 L0 40 Z" fill="#C9A962" />
        </svg>
      </div>
      <div className="absolute top-6 right-6 w-24 h-24 opacity-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M100 0 L60 0 L60 5 L95 5 L95 40 L100 40 Z" fill="#C9A962" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 w-24 h-24 opacity-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 100 L40 100 L40 95 L5 95 L5 60 L0 60 Z" fill="#C9A962" />
        </svg>
      </div>
      <div className="absolute bottom-6 right-6 w-24 h-24 opacity-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M100 100 L60 100 L60 95 L95 95 L95 60 L100 60 Z" fill="#C9A962" />
        </svg>
      </div>

      {/* Side metadata */}
      <div
        className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 opacity-0"
        style={{ animation: isLoaded ? "fadeIn 0.8s ease-out 2.3s forwards" : "none" }}
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-mono text-[#C9A962]/40 tracking-wider mb-1">VERSION</span>
          <span className="text-sm font-mono text-[#C9A962]/70">B-SIP v1.0</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-mono text-[#C9A962]/40 tracking-wider mb-1">EPOCH</span>
          <span className="text-sm font-mono text-[#C9A962]/70">GENESIS</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-mono text-[#C9A962]/40 tracking-wider mb-1">STATUS</span>
          <span className="text-sm font-mono text-emerald-400/70 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        </div>
      </div>

      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 items-end opacity-0"
        style={{ animation: isLoaded ? "fadeIn 0.8s ease-out 2.3s forwards" : "none" }}
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-[#C9A962]/40 tracking-wider mb-1">ORIGIN</span>
          <span className="text-sm font-mono text-[#C9A962]/70">DUBAI</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-[#C9A962]/40 tracking-wider mb-1">FOUNDER</span>
          <span className="text-sm font-mono text-[#C9A962]/70">MoMo</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-[#C9A962]/40 tracking-wider mb-1">IHSAN</span>
          <span className="text-sm font-mono text-[#C9A962]/70">0.99+</span>
        </div>
      </div>

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(32px); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
