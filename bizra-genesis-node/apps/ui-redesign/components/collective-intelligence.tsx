"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface CollectiveNode {
  id: string
  location: { lat: number; lng: number }
  country: string
  city: string
  consciousnessLevel: number
  contributionScore: number
  lastActive: number
  transformationStage: "seeker" | "awakening" | "growing" | "transcending"
  specialization: string[]
  connections: string[]
}

interface GlobalInsight {
  id: string
  content: string
  author: string
  location: string
  timestamp: number
  resonanceScore: number
  category: "breakthrough" | "wisdom" | "solution" | "discovery"
  verified: boolean
}

interface CollectiveMetrics {
  totalNodes: number
  activeNodes: number
  globalConsciousness: number
  collectiveIQ: number
  transformationVelocity: number
  networkResonance: number
  problemsSolved: number
  wisdomGenerated: number
}

export function RealTimeCollectiveIntelligence() {
  const [collectiveMetrics, setCollectiveMetrics] = useState<CollectiveMetrics>({
    totalNodes: 847392,
    activeNodes: 23847,
    globalConsciousness: 73.2,
    collectiveIQ: 1847,
    transformationVelocity: 12.4,
    networkResonance: 89.7,
    problemsSolved: 15847,
    wisdomGenerated: 2847,
  })

  const [globalInsights, setGlobalInsights] = useState<GlobalInsight[]>([])
  const [networkActivity, setNetworkActivity] = useState<
    Array<{
      type: "connection" | "breakthrough" | "collaboration" | "transformation"
      location: string
      impact: number
      timestamp: number
    }>
  >([])

  useEffect(() => {
    const updateCollectiveMetrics = () => {
      setCollectiveMetrics((prev) => ({
        totalNodes: prev.totalNodes + Math.floor(Math.random() * 10) + 1,
        activeNodes: prev.activeNodes + Math.floor(Math.random() * 20) - 10,
        globalConsciousness: Math.min(100, prev.globalConsciousness + (Math.random() - 0.5) * 0.5),
        collectiveIQ: prev.collectiveIQ + Math.floor(Math.random() * 5) - 2,
        transformationVelocity: Math.max(0, prev.transformationVelocity + (Math.random() - 0.5) * 2),
        networkResonance: Math.min(100, Math.max(0, prev.networkResonance + (Math.random() - 0.5) * 3)),
        problemsSolved: prev.problemsSolved + Math.floor(Math.random() * 3),
        wisdomGenerated: prev.wisdomGenerated + Math.floor(Math.random() * 2),
      }))
    }

    const generateGlobalInsight = () => {
      const insights = [
        {
          content: "Breakthrough in quantum consciousness synchronization achieved in Tokyo lab",
          author: "Dr. Yuki Tanaka",
          location: "Tokyo, Japan",
          category: "breakthrough" as const,
          specialization: "Quantum Physics",
        },
        {
          content: "Community-driven solution eliminates food waste in 47 neighborhoods",
          author: "Maria Santos",
          location: "São Paulo, Brazil",
          category: "solution" as const,
          specialization: "Social Innovation",
        },
        {
          content: "AI-human collaboration creates new sustainable energy model",
          author: "Ahmed Hassan",
          location: "Cairo, Egypt",
          category: "discovery" as const,
          specialization: "Clean Energy",
        },
        {
          content: "Collective meditation session raises global consciousness field by 0.3%",
          author: "Priya Sharma",
          location: "Mumbai, India",
          category: "wisdom" as const,
          specialization: "Consciousness Studies",
        },
        {
          content: "Distributed computing network solves climate modeling challenge",
          author: "Erik Johansson",
          location: "Stockholm, Sweden",
          category: "breakthrough" as const,
          specialization: "Climate Science",
        },
      ]

      const randomInsight = insights[Math.floor(Math.random() * insights.length)]
      const newInsight: GlobalInsight = {
        id: `insight-${Date.now()}`,
        content: randomInsight.content,
        author: randomInsight.author,
        location: randomInsight.location,
        timestamp: Date.now(),
        resonanceScore: Math.floor(Math.random() * 100) + 50,
        category: randomInsight.category,
        verified: Math.random() > 0.2,
      }

      setGlobalInsights((prev) => [newInsight, ...prev.slice(0, 9)])
    }

    const generateNetworkActivity = () => {
      const activities = [
        { type: "connection" as const, location: "Global Network", impact: Math.random() * 50 + 10 },
        { type: "breakthrough" as const, location: "Research Hub", impact: Math.random() * 100 + 50 },
        { type: "collaboration" as const, location: "Community Node", impact: Math.random() * 75 + 25 },
        { type: "transformation" as const, location: "Consciousness Field", impact: Math.random() * 90 + 30 },
      ]

      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      const newActivity = {
        ...randomActivity,
        timestamp: Date.now(),
      }

      setNetworkActivity((prev) => [newActivity, ...prev.slice(0, 19)])
    }

    // Update intervals
    const metricsInterval = setInterval(updateCollectiveMetrics, 3000)
    const insightsInterval = setInterval(generateGlobalInsight, 8000)
    const activityInterval = setInterval(generateNetworkActivity, 2000)

    // Initial data
    generateGlobalInsight()
    generateNetworkActivity()

    return () => {
      clearInterval(metricsInterval)
      clearInterval(insightsInterval)
      clearInterval(activityInterval)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Global Collective Metrics */}
      <Card className="luxury-glass-morphism border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">
              GLOBAL COLLECTIVE INTELLIGENCE
            </span>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          </div>
          <div className="text-xs text-muted-foreground">Live metrics from the BIZRA consciousness network</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">{collectiveMetrics.totalNodes.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Nodes</div>
            <div className="text-xs text-white">+{Math.floor(Math.random() * 50) + 10}/min</div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">{collectiveMetrics.globalConsciousness.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Global Consciousness</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-accent h-1 rounded-full transition-all duration-1000"
                style={{ width: `${collectiveMetrics.globalConsciousness}%` }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">{collectiveMetrics.collectiveIQ.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Collective IQ</div>
            <div className="text-xs text-primary">+{collectiveMetrics.transformationVelocity.toFixed(1)}/hr</div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">{collectiveMetrics.networkResonance.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Network Resonance</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-1000"
                style={{ width: `${collectiveMetrics.networkResonance}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-primary/20">
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-1">{collectiveMetrics.problemsSolved.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Problems Solved Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-1">
              {collectiveMetrics.wisdomGenerated.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Wisdom Units Generated</div>
          </div>
        </div>
      </Card>

      {/* Live Global Insights */}
      <Card className="luxury-glass-morphism border border-accent/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">LIVE GLOBAL INSIGHTS</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto">
          {globalInsights.map((insight) => (
            <div key={insight.id} className="border-l-2 border-primary/30 pl-4 py-2">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      insight.category === "breakthrough"
                        ? "bg-accent/20 text-accent"
                        : insight.category === "wisdom"
                          ? "bg-primary/20 text-primary"
                          : insight.category === "solution"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {insight.category.toUpperCase()}
                  </span>
                  {insight.verified && <span className="text-xs text-green-400">✓ VERIFIED</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.floor((Date.now() - insight.timestamp) / 1000)}s ago
                </div>
              </div>
              <p className="text-sm text-foreground mb-2">{insight.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {insight.author} • {insight.location}
                </span>
                <span>Resonance: {insight.resonanceScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-time Network Activity */}
      <Card className="luxury-glass-morphism border border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-primary font-serif font-bold text-sm uppercase tracking-wide">
            NETWORK ACTIVITY STREAM
          </span>
          <div className="text-xs text-muted-foreground">
            {collectiveMetrics.activeNodes.toLocaleString()} nodes active
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {networkActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 rounded bg-background/20">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "connection"
                      ? "bg-blue-400"
                      : activity.type === "breakthrough"
                        ? "bg-accent"
                        : activity.type === "collaboration"
                          ? "bg-green-400"
                          : "bg-purple-400"
                  } animate-pulse`}
                ></div>
                <span className="text-sm text-foreground capitalize">
                  {activity.type} in {activity.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent">+{activity.impact.toFixed(1)} impact</span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor((Date.now() - activity.timestamp) / 1000)}s
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Collective Consciousness Field */}
      <CollectiveConsciousnessField />

      {/* Global Transformation Map */}
      <GlobalTransformationMap />

      {/* Collective Wisdom Stream */}
      <CollectiveWisdomStream />
    </div>
  )
}

export function CollectiveConsciousnessField() {
  const [fieldStrength, setFieldStrength] = useState(73.5)
  const [resonancePattern, setResonancePattern] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const updateField = () => {
      const consciousnessData = (window as any).consciousnessMetrics
      const baseStrength = consciousnessData ? consciousnessData.spiritualResonance : 50

      // Simulate collective field fluctuations
      const collectiveInfluence = Math.sin(Date.now() * 0.001) * 20 + 70
      const newStrength = (baseStrength + collectiveInfluence) / 2

      setFieldStrength(newStrength)

      // Generate resonance pattern
      const pattern = Array.from({ length: 50 }, (_, i) => Math.sin(Date.now() * 0.002 + i * 0.2) * 50 + 50)
      setResonancePattern(pattern)
    }

    const renderField = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw collective consciousness field
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
      )

      const alpha = (fieldStrength / 100) * 0.3
      gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(147, 51, 234, ${alpha * 0.7})`)
      gradient.addColorStop(1, `rgba(212, 175, 55, ${alpha * 0.3})`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw resonance waves
      ctx.strokeStyle = `rgba(212, 175, 55, ${alpha * 2})`
      ctx.lineWidth = 2
      ctx.beginPath()

      resonancePattern.forEach((value, i) => {
        const x = (i / resonancePattern.length) * canvas.width
        const y = canvas.height / 2 + (value - 50) * 2

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })

      ctx.stroke()
    }

    const interval = setInterval(() => {
      updateField()
      renderField()
    }, 100)

    return () => clearInterval(interval)
  }, []) // Empty dependency array to prevent infinite re-renders

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-6">
      <div className="text-center mb-4">
        <span className="text-accent font-serif font-bold text-sm uppercase tracking-wide">
          COLLECTIVE CONSCIOUSNESS FIELD
        </span>
        <div className="text-xs text-muted-foreground mt-1">
          Field Strength: {fieldStrength.toFixed(1)}% • Resonance: Active
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-32 rounded-lg"
          aria-label="Collective consciousness field visualization"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent mb-1">{Math.floor(fieldStrength)}%</div>
            <div className="text-xs text-muted-foreground">FIELD COHERENCE</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function GlobalTransformationMap() {
  const [transformationHotspots, setTransformationHotspots] = useState<
    Array<{
      location: string
      intensity: number
      type: "breakthrough" | "growth" | "awakening"
      participants: number
    }>
  >([])

  useEffect(() => {
    const locations = [
      { location: "Silicon Valley", type: "breakthrough" as const },
      { location: "Tokyo", type: "growth" as const },
      { location: "London", type: "awakening" as const },
      { location: "São Paulo", type: "growth" as const },
      { location: "Mumbai", type: "awakening" as const },
      { location: "Berlin", type: "breakthrough" as const },
      { location: "Singapore", type: "growth" as const },
      { location: "Tel Aviv", type: "breakthrough" as const },
    ]

    const updateHotspots = () => {
      const hotspots = locations.map((loc) => ({
        ...loc,
        intensity: Math.random() * 100,
        participants: Math.floor(Math.random() * 5000) + 100,
      }))
      setTransformationHotspots(hotspots)
    }

    updateHotspots()
    const interval = setInterval(updateHotspots, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-primary/20 p-6">
      <div className="text-center mb-4">
        <span className="text-primary font-serif font-bold text-sm uppercase tracking-wide">
          GLOBAL TRANSFORMATION MAP
        </span>
        <div className="text-xs text-muted-foreground mt-1">Real-time consciousness evolution hotspots</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {transformationHotspots.map((hotspot, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-background/20">
            <div
              className={`w-3 h-3 rounded-full mx-auto mb-2 animate-pulse ${
                hotspot.type === "breakthrough"
                  ? "bg-accent"
                  : hotspot.type === "growth"
                    ? "bg-primary"
                    : "bg-green-400"
              }`}
            ></div>
            <div className="text-sm font-bold text-foreground mb-1">{hotspot.location}</div>
            <div className="text-xs text-muted-foreground mb-1">{hotspot.participants.toLocaleString()} active</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-1000 ${
                  hotspot.type === "breakthrough"
                    ? "bg-accent"
                    : hotspot.type === "growth"
                      ? "bg-primary"
                      : "bg-green-400"
                }`}
                style={{ width: `${hotspot.intensity}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function CollectiveWisdomStream() {
  const [wisdomPearls, setWisdomPearls] = useState<
    Array<{
      id: string
      wisdom: string
      author: string
      resonance: number
      timestamp: number
    }>
  >([])

  useEffect(() => {
    const wisdomDatabase = [
      "The network effect of consciousness multiplies individual potential exponentially",
      "Every problem solved by one human becomes a solution available to all",
      "Collective intelligence emerges when individual minds synchronize with shared purpose",
      "The quantum field of consciousness connects all minds across space and time",
      "Transformation accelerates when communities align their intentions",
      "Individual awakening creates ripples that elevate collective consciousness",
      "The wisdom of crowds becomes the intelligence of the connected",
      "Shared knowledge grows stronger when filtered through collective discernment",
    ]

    const authors = [
      "Network Philosopher",
      "Quantum Researcher",
      "Consciousness Explorer",
      "Systems Thinker",
      "Collective Intelligence Specialist",
      "Wisdom Keeper",
    ]

    const generateWisdom = () => {
      const newWisdom = {
        id: `wisdom-${Date.now()}`,
        wisdom: wisdomDatabase[Math.floor(Math.random() * wisdomDatabase.length)],
        author: authors[Math.floor(Math.random() * authors.length)],
        resonance: Math.floor(Math.random() * 40) + 60,
        timestamp: Date.now(),
      }

      setWisdomPearls((prev) => [newWisdom, ...prev.slice(0, 4)])
    }

    generateWisdom()
    const interval = setInterval(generateWisdom, 12000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-6">
      <div className="text-center mb-4">
        <span className="text-accent font-serif font-bold text-sm uppercase tracking-wide">
          COLLECTIVE WISDOM STREAM
        </span>
        <div className="text-xs text-muted-foreground mt-1">
          Insights emerging from the global consciousness network
        </div>
      </div>

      <div className="space-y-4">
        {wisdomPearls.map((pearl) => (
          <div
            key={pearl.id}
            className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20"
          >
            <p className="text-sm text-foreground italic mb-3 leading-relaxed">"{pearl.wisdom}"</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">— {pearl.author}</span>
              <div className="flex items-center gap-2">
                <span className="text-accent">Resonance: {pearl.resonance}%</span>
                <span className="text-muted-foreground">{Math.floor((Date.now() - pearl.timestamp) / 1000)}s ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
