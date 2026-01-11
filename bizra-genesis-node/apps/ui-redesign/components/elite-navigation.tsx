"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Shield, TrendingUp, Activity, ChevronRight, Lock, Crown } from "lucide-react"

interface EliteNavigationProps {
  onNavigate: (section: string) => void
  currentSection: string
}

const EliteNavigation: React.FC<EliteNavigationProps> = ({ onNavigate, currentSection }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const navigationItems = [
    {
      id: "executive-dashboard",
      title: "Executive Command Center",
      description: "Real-time performance metrics and network status",
      icon: BarChart3,
      badge: "LIVE",
      badgeColor: "bg-green-500",
      premium: true,
    },
    {
      id: "verification-matrix",
      title: "Elite Verification Matrix",
      description: "Professional-grade system validation",
      icon: Shield,
      badge: "VERIFIED",
      badgeColor: "bg-blue-500",
      premium: true,
    },
    {
      id: "market-intelligence",
      title: "Market Intelligence Hub",
      description: "Competitive analysis and growth projections",
      icon: TrendingUp,
      badge: "ALPHA",
      badgeColor: "bg-purple-500",
      premium: true,
    },
    {
      id: "system-health",
      title: "System Health Monitor",
      description: "Infrastructure monitoring and optimization",
      icon: Activity,
      badge: "OPTIMAL",
      badgeColor: "bg-green-500",
      premium: true,
    },
  ]

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Elite Access Toggle */}
      <div className="mb-4">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="luxury-button-glow bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-serif font-bold shadow-2xl border border-yellow-300"
          size="lg"
        >
          <Crown className="w-5 h-5 mr-2" />
          Elite Access
          <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </Button>
      </div>

      {/* Elite Navigation Panel */}
      {isExpanded && (
        <Card className="bg-background/95 backdrop-blur-sm border-border/20 shadow-2xl min-w-[320px] max-w-[400px]">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-primary">Elite Command Center</h3>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">PROFESSIONAL</Badge>
            </div>

            <div className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentSection === item.id

                return (
                  <Button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-4 ${
                      isActive ? "bg-primary/20 border border-primary/30 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{item.title}</span>
                          {item.premium && <Lock className="w-3 h-3 text-yellow-500" />}
                          <Badge className={`${item.badgeColor} text-white text-xs px-2 py-0.5`}>{item.badge}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-400">Elite Practitioner Status</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Access professional-grade analytics and business intelligence tools
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Performance Score:</span>
                <span className="text-green-400 font-bold">98.7%</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EliteNavigation
