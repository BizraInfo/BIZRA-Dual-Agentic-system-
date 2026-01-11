"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { SacredButton, SacredLogo, COLORS } from "@/lib/design-system"
import { Menu } from "lucide-react"

interface GenesisNavProps {
  onLogin?: () => void
  isAuthenticated?: boolean
}

export function GenesisNav({ onLogin, isAuthenticated }: GenesisNavProps) {
  const navRef = useRef<HTMLElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    gsap.to(navRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 2,
    })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-40 px-6 transition-all duration-500 flex justify-between items-center opacity-0 translate-y-[-20px] ${
        isScrolled ? "backdrop-blur-md border-b py-4" : "py-6 mix-blend-difference"
      }`}
      style={{
        backgroundColor: isScrolled ? `${COLORS.navy[900]}CC` : "transparent",
        borderBottomColor: isScrolled ? `${COLORS.gold[500]}1A` : "transparent",
      }}
    >
      <div className="font-bold text-xl tracking-widest flex items-center gap-3 text-white">
        <SacredLogo size="sm" />
        BIZRA
      </div>

      <div className="hidden md:flex items-center gap-8">
        {!isAuthenticated ? (
          <div className="flex gap-8 text-xs uppercase tracking-[0.2em] text-white">
            <a
              href="#genesis"
              className="hover:text-[var(--gold)] transition-colors"
              style={{ ["--gold" as string]: COLORS.gold[500] }}
            >
              Genesis
            </a>
            <a
              href="#message"
              className="hover:text-[var(--gold)] transition-colors"
              style={{ ["--gold" as string]: COLORS.gold[500] }}
            >
              Message
            </a>
            <a
              href="#rules"
              className="hover:text-[var(--gold)] transition-colors"
              style={{ ["--gold" as string]: COLORS.gold[500] }}
            >
              Rules
            </a>
            <a
              href="#vision"
              className="hover:text-[var(--gold)] transition-colors"
              style={{ ["--gold" as string]: COLORS.gold[500] }}
            >
              Vision
            </a>
          </div>
        ) : (
          <div className="flex gap-8 text-xs uppercase tracking-[0.2em] text-white">
            <span style={{ color: COLORS.gold[500] }}>Dashboard</span>
            <span className="text-white/60">Neural Garden</span>
            <span className="text-white/60">Network</span>
          </div>
        )}

        {!isAuthenticated && onLogin && (
          <SacredButton onClick={onLogin} variant="primary" size="md">
            Connect Node
          </SacredButton>
        )}
      </div>

      <button className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </button>
    </nav>
  )
}
