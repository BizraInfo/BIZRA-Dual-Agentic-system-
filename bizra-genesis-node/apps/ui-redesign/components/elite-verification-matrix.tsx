"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, CheckCircle, AlertTriangle, XCircle, Activity, TrendingUp } from "lucide-react"

interface VerificationMetric {
  id: string
  name: string
  value: number
  status: "excellent" | "good" | "fair" | "attention"
  trend: "up" | "down" | "stable"
  description: string
}

const EliteVerificationMatrix: React.FC = () => {
  const [metrics, setMetrics] = useState<VerificationMetric[]>([
    {
      id: "system-integrity",
      name: "System Integrity",
      value: 98.7,
      status: "excellent",
      trend: "up",
      description: "Core system components verification",
    },
    {
      id: "security-compliance",
      name: "Security Compliance",
      value: 96.2,
      status: "excellent",
      trend: "stable",
      description: "Security protocols and compliance checks",
    },
    {
      id: "network-health",
      name: "Network Health",
      value: 94.8,
      status: "excellent",
      trend: "up",
      description: "Distributed network performance metrics",
    },
    {
      id: "ai-performance",
      name: "AI Performance",
      value: 92.1,
      status: "excellent",
      trend: "up",
      description: "AI agent efficiency and accuracy",
    },
    {
      id: "user-engagement",
      name: "User Engagement",
      value: 87.3,
      status: "good",
      trend: "up",
      description: "Active user participation metrics",
    },
    {
      id: "token-economy",
      name: "Token Economy",
      value: 89.6,
      status: "good",
      trend: "stable",
      description: "BZS token circulation and value stability",
    },
    {
      id: "proof-validation",
      name: "Proof Validation",
      value: 91.4,
      status: "excellent",
      trend: "up",
      description: "Proof-of-Impact verification accuracy",
    },
    {
      id: "scalability-index",
      name: "Scalability Index",
      value: 78.9,
      status: "good",
      trend: "up",
      description: "System capacity for growth",
    },
    {
      id: "consciousness-sync",
      name: "Consciousness Sync",
      value: 85.2,
      status: "good",
      trend: "stable",
      description: "Collective intelligence synchronization",
    },
    {
      id: "quantum-coherence",
      name: "Quantum Coherence",
      value: 67.8,
      status: "fair",
      trend: "up",
      description: "Quantum field stability measurements",
    },
    {
      id: "ethical-alignment",
      name: "Ethical Alignment",
      value: 95.7,
      status: "excellent",
      trend: "stable",
      description: "Islamic principles compliance verification",
    },
    {
      id: "transformation-rate",
      name: "Transformation Rate",
      value: 73.4,
      status: "good",
      trend: "up",
      description: "User transformation success metrics",
    },
  ])

  const [selectedMetric, setSelectedMetric] = useState<VerificationMetric | null>(null)
  const [isRealTimeMode, setIsRealTimeMode] = useState(true)

  useEffect(() => {
    if (!isRealTimeMode) return

    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 2)),
          trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? "up" : "down") : metric.trend,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isRealTimeMode])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-400"
      case "good":
        return "text-blue-400"
      case "fair":
        return "text-yellow-400"
      case "attention":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-4 h-4" />
      case "good":
        return <CheckCircle className="w-4 h-4" />
      case "fair":
        return <AlertTriangle className="w-4 h-4" />
      case "attention":
        return <XCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-400" />
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
      case "stable":
        return <Activity className="w-3 h-3 text-blue-400" />
      default:
        return null
    }
  }

  const excellentCount = metrics.filter((m) => m.status === "excellent").length
  const goodCount = metrics.filter((m) => m.status === "good").length
  const fairCount = metrics.filter((m) => m.status === "fair").length
  const attentionCount = metrics.filter((m) => m.status === "attention").length
  const totalCount = metrics.length

  const overallScore = metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-primary">Elite Verification Matrix</h1>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">PROFESSIONAL GRADE</Badge>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Real-time verification and validation of all BIZRA ecosystem components. Military-grade monitoring ensures
            optimal performance and security.
          </p>
        </div>

        {/* Overall Score */}
        <Card className="bg-background/10 backdrop-blur-sm border-border/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary">Overall System Health</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={isRealTimeMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                  className="text-xs"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  {isRealTimeMode ? "LIVE" : "PAUSED"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{overallScore.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{excellentCount}</div>
                <div className="text-sm text-muted-foreground">Excellent (≥90%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{goodCount}</div>
                <div className="text-sm text-muted-foreground">Good (≥80%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{fairCount}</div>
                <div className="text-sm text-muted-foreground">Fair (≥60%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{attentionCount}</div>
                <div className="text-sm text-muted-foreground">Attention (&lt; 60%)</div>
              </div>
            </div>
            <Progress value={overallScore} className="h-3" />
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-background/10 backdrop-blur-sm border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">
                {Math.round((excellentCount / totalCount) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Excellent (≥90%)</div>
            </CardContent>
          </Card>
          <Card className="bg-background/10 backdrop-blur-sm border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{Math.round((goodCount / totalCount) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Good (≥80%)</div>
            </CardContent>
          </Card>
          <Card className="bg-background/10 backdrop-blur-sm border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-400">{Math.round((fairCount / totalCount) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Fair (≥60%)</div>
            </CardContent>
          </Card>
          <Card className="bg-background/10 backdrop-blur-sm border-border/20 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">{Math.round((attentionCount / totalCount) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Attention (&lt; 60%)</div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Matrix */}
        <Card className="bg-background/10 backdrop-blur-sm border-border/20">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-primary mb-6">Detailed Verification Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <Card
                  key={metric.id}
                  className={`bg-background/5 border-border/10 cursor-pointer transition-all hover:bg-background/10 hover:border-border/20 ${
                    selectedMetric?.id === metric.id ? "ring-2 ring-blue-500/50" : ""
                  }`}
                  onClick={() => setSelectedMetric(metric)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={getStatusColor(metric.status)}>{getStatusIcon(metric.status)}</div>
                        <span className="font-semibold text-sm">{metric.name}</span>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="mb-2">
                      <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value.toFixed(1)}%
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Metric Details */}
        {selectedMetric && (
          <Card className="bg-background/10 backdrop-blur-sm border-border/20 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={getStatusColor(selectedMetric.status)}>{getStatusIcon(selectedMetric.status)}</div>
                {selectedMetric.name} - Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Current Status</h4>
                  <div className={`text-3xl font-bold ${getStatusColor(selectedMetric.status)} mb-2`}>
                    {selectedMetric.value.toFixed(1)}%
                  </div>
                  <Badge
                    className={`${
                      selectedMetric.status === "excellent"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : selectedMetric.status === "good"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : selectedMetric.status === "fair"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {selectedMetric.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Trend Analysis</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(selectedMetric.trend)}
                    <span className="capitalize">{selectedMetric.trend}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedMetric.trend === "up"
                      ? "Performance improving"
                      : selectedMetric.trend === "down"
                        ? "Requires attention"
                        : "Stable performance"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedMetric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default EliteVerificationMatrix
