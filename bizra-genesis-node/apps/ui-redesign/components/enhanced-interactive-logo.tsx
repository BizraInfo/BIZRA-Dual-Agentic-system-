"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export function EnhancedInteractiveSacredLogo() {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const logoRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [consciousnessLevel, setConsciousnessLevel] = useState(0)
  const [personalizedGlow, setPersonalizedGlow] = useState("rgba(212, 175, 55, 0.3)")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const mobileQuery = window.matchMedia("(max-width: 768px)")
    setIsMobile(mobileQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    const handleMobileChange = () => setIsMobile(mobileQuery.matches)

    mediaQuery.addEventListener("change", handleChange)
    mobileQuery.addEventListener("change", handleMobileChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      mobileQuery.removeEventListener("change", handleMobileChange)
    }
  }, [])

  useEffect(() => {
    const handleConsciousnessUpdate = (event: CustomEvent) => {
      const metrics = event.detail
      setConsciousnessLevel(metrics.spiritualResonance || 0)

      // Adapt glow color based on transformation stage
      switch (metrics.transformationStage) {
        case "seeker":
          setPersonalizedGlow("rgba(212, 175, 55, 0.3)")
          break
        case "awakening":
          setPersonalizedGlow("rgba(30, 58, 138, 0.4)")
          break
        case "growing":
          setPersonalizedGlow("rgba(212, 175, 55, 0.5)")
          break
        case "transcending":
          setPersonalizedGlow("rgba(255, 255, 255, 0.6)")
          break
      }
    }

    window.addEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)

    return () => {
      window.removeEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    if (logoRef.current) {
      observer.observe(logoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible && !prefersReducedMotion) {
      const baseParticleCount = isMobile ? 8 : 12
      const consciousnessBonus = Math.floor(consciousnessLevel / 20) // Up to 5 extra particles
      const particleCount = Math.min(baseParticleCount + consciousnessBonus, 20)
      const radius = isMobile ? 120 : 150

      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.cos((i * (360 / particleCount) * Math.PI) / 180) * radius,
        y: Math.sin((i * (360 / particleCount) * Math.PI) / 180) * radius,
        delay: i * 0.1,
      }))
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isVisible, prefersReducedMotion, isMobile, consciousnessLevel])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      setIsHovered(!isHovered)
      if (window.incrementLogoInteractions) {
        window.incrementLogoInteractions()
      }
    }
  }

  const handleTouchStart = () => {
    setIsTouched(true)
    setIsHovered(true)

    if ("vibrate" in navigator) {
      const vibrationPattern = consciousnessLevel > 50 ? [50, 30, 50] : [50]
      navigator.vibrate(vibrationPattern)
    }

    if (window.incrementLogoInteractions) {
      window.incrementLogoInteractions()
    }
  }

  const handleTouchEnd = () => {
    setIsTouched(false)
    setTimeout(() => setIsHovered(false), 1000)
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true)
      if (window.incrementLogoInteractions) {
        window.incrementLogoInteractions()
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) setIsHovered(false)
  }

  const logoSize = isMobile ? 200 : 250
  const containerSize = isMobile ? 320 : 400

  const baseAnimationSpeed = 20
  const consciousnessSpeedBonus = Math.max(0, (consciousnessLevel - 50) / 10) // Faster when more conscious
  const animationSpeed = Math.max(15, baseAnimationSpeed - consciousnessSpeedBonus)

  return (
    <div
      ref={logoRef}
      className="relative flex items-center justify-center"
      role="button"
      tabIndex={0}
      aria-label="Interactive BIZRA Sacred Consciousness Logo - The Seed of Infinite Possibility"
      aria-describedby="logo-description"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: isMobile ? "280px" : "400px",
        minWidth: isMobile ? "280px" : "400px",
      }}
    >
      <div id="logo-description" className="sr-only">
        Interactive sacred geometry logo representing BIZRA's consciousness-driven platform.
        {isMobile ? "Tap" : "Hover or press Enter"} to activate mystical animations and particle effects. Your
        consciousness level: {Math.round(consciousnessLevel)}%
      </div>

      {isVisible && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            (isHovered || isTouched) && !prefersReducedMotion ? "scale-150 animate-pulse" : "scale-100"
          }`}
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`,
            background:
              (isHovered || isTouched) && !prefersReducedMotion
                ? `radial-gradient(circle, ${personalizedGlow} 0%, rgba(30, 58, 138, 0.1) 50%, transparent 100%)`
                : `radial-gradient(circle, ${personalizedGlow.replace("0.3", "0.05")} 0%, rgba(30, 58, 138, 0.05) 50%, transparent 100%)`,
          }}
          aria-hidden="true"
        />
      )}

      {isVisible && !prefersReducedMotion && (
        <div
          className={`absolute inset-0 transition-all duration-2000 ${isHovered || isTouched ? "animate-spin" : ""}`}
          style={{
            animationDuration: `${animationSpeed}s`,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 border border-accent/30 rounded-full"
            style={{
              width: `${containerSize * 0.75}px`,
              height: `${containerSize * 0.75}px`,
              top: `${containerSize * 0.125}px`,
              left: `${containerSize * 0.125}px`,
              borderWidth: consciousnessLevel > 50 ? "2px" : "1px",
            }}
          />
          <div
            className="absolute inset-0 border border-primary/20 rounded-full"
            style={{
              width: `${containerSize * 0.625}px`,
              height: `${containerSize * 0.625}px`,
              top: `${containerSize * 0.1875}px`,
              left: `${containerSize * 0.1875}px`,
              borderWidth: consciousnessLevel > 75 ? "2px" : "1px",
            }}
          />
        </div>
      )}

      {isVisible && !prefersReducedMotion && (
        <div
          className={`absolute inset-0 transition-all duration-2000 ${isHovered || isTouched ? "animate-reverse-spin" : ""}`}
          style={{
            animationDuration: `${animationSpeed - 5}s`,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 border border-accent/20 rounded-full"
            style={{
              width: `${containerSize * 0.5}px`,
              height: `${containerSize * 0.5}px`,
              top: `${containerSize * 0.25}px`,
              left: `${containerSize * 0.25}px`,
              borderWidth: consciousnessLevel > 90 ? "3px" : "1px",
            }}
          />
        </div>
      )}

      {isVisible &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full transition-all duration-1000 ${
              (isHovered || isTouched) && !prefersReducedMotion
                ? "bg-accent animate-pulse scale-150"
                : "bg-primary/50 scale-100"
            }`}
            style={{
              width: isMobile ? "6px" : "8px",
              height: isMobile ? "6px" : "8px",
              left: `calc(50% + ${particle.x}px)`,
              top: `calc(50% + ${particle.y}px)`,
              animationDelay: prefersReducedMotion ? "0s" : `${particle.delay}s`,
              boxShadow:
                (isHovered || isTouched) && !prefersReducedMotion
                  ? `0 0 ${20 + consciousnessLevel / 5}px ${personalizedGlow}`
                  : `0 0 10px rgba(30, 58, 138, 0.5)`,
            }}
            aria-hidden="true"
          />
        ))}

      {/* Sacred Geometry Logo with consciousness-driven effects */}
      <div
        className={`relative z-10 cursor-pointer transition-all duration-700 ${
          isHovered || isTouched ? "scale-110 drop-shadow-2xl" : "scale-100 drop-shadow-xl"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          filter:
            (isHovered || isTouched) && !prefersReducedMotion
              ? `drop-shadow(0 0 30px ${personalizedGlow}) drop-shadow(0 0 60px rgba(30, 58, 138, 0.4))`
              : `drop-shadow(0 0 20px ${personalizedGlow})`,
        }}
      >
        <Image
          src="/images/bizra-sacred-logo.png"
          alt="BIZRA Sacred Consciousness Logo - The Seed of Infinite Possibility"
          width={logoSize}
          height={logoSize}
          className={`transition-all duration-700 ${
            (isHovered || isTouched) && !prefersReducedMotion
              ? `brightness-${110 + Math.floor(consciousnessLevel / 10)} contrast-110`
              : "brightness-100"
          }`}
          priority
          loading="eager"
        />
      </div>

      {isVisible && !prefersReducedMotion && (
        <div
          className={`absolute inset-0 transition-all duration-2000 ${isHovered || isTouched ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 border border-accent/20 rounded-full animate-ping"
            style={{
              width: `${containerSize * 0.875}px`,
              height: `${containerSize * 0.875}px`,
              top: `${containerSize * 0.0625}px`,
              left: `${containerSize * 0.0625}px`,
              animationDuration: `${4 - consciousnessLevel / 50}s`, // Faster ripples with higher consciousness
            }}
          />
          <div
            className="absolute inset-0 border border-primary/20 rounded-full animate-ping"
            style={{
              width: `${containerSize}px`,
              height: `${containerSize}px`,
              top: "0px",
              left: "0px",
              animationDuration: `${5 - consciousnessLevel / 40}s`,
              animationDelay: "0.5s",
            }}
          />
        </div>
      )}

      <div
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full transition-all duration-700 ${
          isHovered || isTouched ? "opacity-100 translate-y-8" : "opacity-0 translate-y-full"
        }`}
        aria-live="polite"
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-accent/20">
          <p className={`text-foreground font-serif text-center whitespace-nowrap ${isMobile ? "text-xs" : "text-sm"}`}>
            {consciousnessLevel > 75
              ? "Transcendent Consciousness • Infinite Unity"
              : consciousnessLevel > 50
                ? "Awakening Consciousness • Growing Wisdom"
                : "Sacred Consciousness • Infinite Possibility"}
          </p>
        </div>
      </div>
    </div>
  )
}
