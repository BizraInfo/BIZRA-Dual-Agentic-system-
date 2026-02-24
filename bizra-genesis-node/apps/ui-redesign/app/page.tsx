"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MasterLayout } from "@/components/master-layout"
import { CinematicLoader } from "@/components/cinematic-loader"
import { SVGMaskHero } from "@/components/svg-mask-hero"
import { UnifiedFeatureSection } from "@/components/unified-feature-section"
import { GenesisNav } from "@/components/genesis-nav"
import { GenesisMessage } from "@/components/genesis-message"
import { GenesisRules } from "@/components/genesis-rules"
import { GenesisVision } from "@/components/genesis-vision"
import { GenesisFooter } from "@/components/genesis-footer"
import { AuthFlow } from "@/components/auth-flow"
import { SacredDashboard } from "@/components/sacred-dashboard"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { SacredGrid } from "@/lib/design-system"

export default function Home() {
  const [appState, setAppState] = useState<"loading" | "landing" | "auth" | "dashboard">("loading")
  const [session, setSession] = useState<any>(null)

  const handleLoaderComplete = () => setAppState("landing")
  const handleLoginClick = () => {
    setAppState("auth")
    setTimeout(() => {
      document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }
  const handleAuthenticated = (newSession: any) => {
    setSession(newSession)
    setAppState("dashboard")
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 100)
  }
  const handleLogout = () => {
    setSession(null)
    setAppState("landing")
  }

  return (
    <MasterLayout>
      <SacredGrid />

      <AnimatePresence mode="wait">
        {appState === "loading" && <CinematicLoader key="loader" onComplete={handleLoaderComplete} />}

        {(appState === "landing" || appState === "auth") && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <GenesisNav onLogin={handleLoginClick} isAuthenticated={false} />

            <SVGMaskHero />

            <UnifiedFeatureSection />

            <GenesisMessage />
            <GenesisRules />

            <section id="auth-section" className="relative">
              {appState === "auth" ? (
                <div className="py-24 container mx-auto px-4">
                  <AuthFlow onAuthenticated={handleAuthenticated} />
                </div>
              ) : (
                <GenesisVision onGetStarted={handleLoginClick} />
              )}
            </section>

            <GenesisFooter />
          </motion.div>
        )}

        {appState === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen"
          >
            <GenesisNav isAuthenticated={true} />

            <div className="container mx-auto px-4 py-24 space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-serif text-[#F8F6F1]">Command Center</h1>
                  <p className="text-[#8892b0]">
                    Welcome back, <span className="text-[#C9A962] font-mono">{session?.user}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-[#C9A962]/20 text-[#C9A962] hover:bg-[#C9A962]/10 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Disconnect
                </Button>
              </div>

              <SacredDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MasterLayout>
  )
}
