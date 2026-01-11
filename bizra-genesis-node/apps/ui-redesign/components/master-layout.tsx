"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CustomCursor } from "@/components/custom-cursor"
import { SystemProvider } from "@/lib/system-context"

export function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SystemProvider>
      <div className="relative min-h-screen bg-[#050B14] text-[#F8F6F1] selection:bg-[#C9A962]/30 selection:text-[#F8F6F1] overflow-x-hidden">
        {/* Global Noise Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]" />
        
        {/* Ambient Background Glow */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A962]/5 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1A2C42]/10 blur-[120px] animate-pulse-slow delay-1000" />
        </div>

        <CustomCursor />

        <main className="relative z-10">
          {children}
        </main>
      </div>
    </SystemProvider>
  )
}
