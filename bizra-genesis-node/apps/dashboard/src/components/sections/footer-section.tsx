"use client"

import { SeedOfLife } from "@/components/sovereign/seed-of-life"

export function FooterSection() {
  return (
    <footer className="relative py-24 border-t border-[#C9A962]/10" style={{ background: "#060D16" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {/* Seed of Life logo */}
          <div className="mb-8 opacity-60">
            <SeedOfLife size={80} animated={false} />
          </div>

          {/* Brand name */}
          <h3 className="text-3xl font-serif text-[#C9A962] mb-2">BIZRA</h3>
          <p
            className="text-lg text-[#C9A962]/60 mb-8"
            style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}
          >
            بذرة الحياة
          </p>

          {/* Ihsan statement */}
          <div className="max-w-xl mb-12">
            <p className="text-sm text-[#C9A962]/40 leading-relaxed">
              Built on الإحسان (Al-Ihsan) — Excellence and goodness in everything. A sovereign protocol for humanity,
              forged through darkness into light.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <a
              href="#genesis"
              className="text-sm font-mono text-[#C9A962]/50 hover:text-[#C9A962] transition-colors tracking-wider"
            >
              GENESIS
            </a>
            <a
              href="#protocol"
              className="text-sm font-mono text-[#C9A962]/50 hover:text-[#C9A962] transition-colors tracking-wider"
            >
              PROTOCOL
            </a>
            <a
              href="/dashboard"
              className="text-sm font-mono text-[#C9A962]/50 hover:text-[#C9A962] transition-colors tracking-wider"
            >
              DASHBOARD
            </a>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-[#C9A962]/20 to-transparent mb-8" />

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-mono text-[#C9A962]/30">
            <span>B-SIP v1.0 // GENESIS EPOCH</span>
            <span className="hidden md:inline">•</span>
            <span>2023-2025 Mahmoud Hassan</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
              IHSAN: 0.99+
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
