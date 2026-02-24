"use client"

import type React from "react"
import { useState, useEffect } from "react"
import EliteNavigation from "./elite-navigation"
import EliteExecutiveDashboard from "./elite-executive-dashboard"
import EliteVerificationMatrix from "./elite-verification-matrix"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Crown } from "lucide-react"

const EliteDashboardContainer: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show elite navigation after a delay to create anticipation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (section: string) => {
    setCurrentSection(section)
  }

  const handleBack = () => {
    setCurrentSection(null)
  }

  // Render full-screen dashboard
  if (currentSection) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {/* Back Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={handleBack}
            variant="outline"
            className="luxury-button-glow border-primary/30 hover:border-primary/50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to BIZRA
          </Button>
        </div>

        {/* Dashboard Content */}
        {currentSection === "executive-dashboard" && <EliteExecutiveDashboard />}
        {currentSection === "verification-matrix" && <EliteVerificationMatrix />}
        {currentSection === "market-intelligence" && (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground flex items-center justify-center">
            <Card className="bg-background/10 backdrop-blur-sm border-border/20 p-12 text-center max-w-2xl">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-primary mb-4">Market Intelligence Hub</h2>
              <p className="text-muted-foreground mb-6">
                Advanced market analysis and competitive intelligence coming soon to Elite Access members.
              </p>
              <div className="text-sm text-yellow-400 font-semibold">🚀 Launching in Elite Access Phase 2</div>
            </Card>
          </div>
        )}
        {currentSection === "system-health" && (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground flex items-center justify-center">
            <Card className="bg-background/10 backdrop-blur-sm border-border/20 p-12 text-center max-w-2xl">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-primary mb-4">System Health Monitor</h2>
              <p className="text-muted-foreground mb-6">
                Real-time infrastructure monitoring and performance optimization tools for Elite practitioners.
              </p>
              <div className="text-sm text-yellow-400 font-semibold">🔧 Advanced monitoring suite in development</div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Render floating navigation
  return isVisible ? <EliteNavigation onNavigate={handleNavigate} currentSection={currentSection || ""} /> : null
}

export default EliteDashboardContainer
