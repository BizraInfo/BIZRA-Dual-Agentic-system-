"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface ConsciousnessMetrics {
  engagementLevel: number
  transformationStage: "seeker" | "awakening" | "growing" | "transcending"
  interactionDepth: number
  spiritualResonance: number
  timeOfDay: "dawn" | "morning" | "midday" | "afternoon" | "evening" | "night"
  sessionDuration: number
  scrollDepth: number
  logoInteractions: number
  mouseMovements: number
  clickPatterns: string[]
  focusTime: number
  interactionVelocity: number
}

export function ConsciousnessTracker() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    engagementLevel: 0,
    transformationStage: "seeker",
    interactionDepth: 0,
    spiritualResonance: 0,
    timeOfDay: "morning",
    sessionDuration: 0,
    scrollDepth: 0,
    logoInteractions: 0,
    mouseMovements: 0,
    clickPatterns: [],
    focusTime: 0,
    interactionVelocity: 0,
  })

  const sessionStartRef = useRef<number>(Date.now())
  const scrollDepthRef = useRef<number>(0)
  const mouseMovementRef = useRef<number>(0)
  const clickPatternRef = useRef<string[]>([])
  const focusTimeRef = useRef<number>(0)
  const lastInteractionTimeRef = useRef<number>(Date.now())
  const lastMouseUpdateRef = useRef<number>(0)
  const mouseUpdateThrottleRef = useRef<number>(1000) // Update every 1 second

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      let timeOfDay: ConsciousnessMetrics["timeOfDay"] = "morning"

      if (hour >= 5 && hour < 8) timeOfDay = "dawn"
      else if (hour >= 8 && hour < 12) timeOfDay = "morning"
      else if (hour >= 12 && hour < 15) timeOfDay = "midday"
      else if (hour >= 15 && hour < 18) timeOfDay = "afternoon"
      else if (hour >= 18 && hour < 22) timeOfDay = "evening"
      else timeOfDay = "night"

      setMetrics((prev) => ({ ...prev, timeOfDay }))
    }

    const trackScrollDepth = () => {
      const scrollPercent = Math.min(
        100,
        Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
      )

      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercent
        setMetrics((prev) => ({
          ...prev,
          scrollDepth: scrollPercent,
          engagementLevel: Math.min(100, prev.engagementLevel + 0.5),
        }))
      }
    }

    const updateSessionDuration = () => {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000)
      setMetrics((prev) => ({ ...prev, sessionDuration: duration }))
    }

    const updateTransformationStage = () => {
      setMetrics((prev) => {
        let stage: ConsciousnessMetrics["transformationStage"] = "seeker"

        if (prev.engagementLevel > 75 && prev.scrollDepth > 80 && prev.logoInteractions > 3) {
          stage = "transcending"
        } else if (prev.engagementLevel > 50 && prev.scrollDepth > 60 && prev.logoInteractions > 2) {
          stage = "growing"
        } else if (prev.engagementLevel > 25 && prev.scrollDepth > 30 && prev.logoInteractions > 0) {
          stage = "awakening"
        }

        return { ...prev, transformationStage: stage }
      })
    }

    const trackMouseMovements = () => {
      mouseMovementRef.current++
      const now = Date.now()

      // Only update state every 1 second to prevent excessive re-renders
      if (now - lastMouseUpdateRef.current > mouseUpdateThrottleRef.current) {
        lastMouseUpdateRef.current = now
        setMetrics((prev) => ({ ...prev, mouseMovements: mouseMovementRef.current }))
      }
    }

    const trackClickPatterns = (event: MouseEvent) => {
      const pattern = `${event.clientX},${event.clientY}`
      clickPatternRef.current.push(pattern)
      setMetrics((prev) => ({ ...prev, clickPatterns: clickPatternRef.current }))
    }

    const trackFocusTime = () => {
      const currentTime = Date.now()
      const focusDuration = Math.floor((currentTime - sessionStartRef.current) / 1000)
      focusTimeRef.current = focusDuration
      setMetrics((prev) => ({ ...prev, focusTime: focusDuration }))
    }

    const trackInteractionVelocity = () => {
      const currentTime = Date.now()
      const interactionDuration = Math.floor((currentTime - lastInteractionTimeRef.current) / 1000)
      const velocity = interactionDuration > 0 ? 1 / interactionDuration : 0
      lastInteractionTimeRef.current = currentTime
      setMetrics((prev) => ({ ...prev, interactionVelocity: velocity }))
    }

    updateTimeOfDay()
    const timeInterval = setInterval(updateTimeOfDay, 60000) // Check every minute
    const sessionInterval = setInterval(updateSessionDuration, 1000) // Update every second
    const stageInterval = setInterval(updateTransformationStage, 5000) // Check every 5 seconds
    const focusInterval = setInterval(trackFocusTime, 1000) // Update focus time every second

    window.addEventListener("scroll", trackScrollDepth)
    window.addEventListener("mousemove", trackMouseMovements)
    window.addEventListener("click", trackClickPatterns)
    window.addEventListener("keydown", trackInteractionVelocity)

    return () => {
      clearInterval(timeInterval)
      clearInterval(sessionInterval)
      clearInterval(stageInterval)
      clearInterval(focusInterval)
      window.removeEventListener("scroll", trackScrollDepth)
      window.removeEventListener("mousemove", trackMouseMovements)
      window.removeEventListener("click", trackClickPatterns)
      window.removeEventListener("keydown", trackInteractionVelocity)
    }
  }, [])

  useEffect(() => {
    // Store metrics in global state or context for other components
    window.consciousnessMetrics = metrics
    window.dispatchEvent(new CustomEvent("consciousnessUpdate", { detail: metrics }))
  }, [metrics])

  const incrementLogoInteractions = () => {
    setMetrics((prev) => ({
      ...prev,
      logoInteractions: prev.logoInteractions + 1,
      interactionDepth: Math.min(100, prev.interactionDepth + 10),
      spiritualResonance: Math.min(100, prev.spiritualResonance + 5),
    }))
  }

  useEffect(() => {
    window.incrementLogoInteractions = incrementLogoInteractions
  }, [])

  return null // This is a tracking component, no UI
}

export function PersonalizedGreeting() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null)
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const handleConsciousnessUpdate = (event: CustomEvent) => {
      setMetrics(event.detail)
    }

    window.addEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)

    return () => {
      window.removeEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!metrics) return

    const generateGreeting = () => {
      const { timeOfDay, transformationStage, engagementLevel } = metrics

      let timeGreeting = ""
      switch (timeOfDay) {
        case "dawn":
          timeGreeting = "As dawn breaks, your consciousness awakens"
          break
        case "morning":
          timeGreeting = "The morning light illuminates your path"
          break
        case "midday":
          timeGreeting = "At the peak of day, your potential shines"
          break
        case "afternoon":
          timeGreeting = "The afternoon brings clarity to your journey"
          break
        case "evening":
          timeGreeting = "As evening falls, wisdom deepens"
          break
        case "night":
          timeGreeting = "In the quiet of night, transformation begins"
          break
      }

      let stageMessage = ""
      switch (transformationStage) {
        case "seeker":
          stageMessage = "Welcome, seeker of infinite possibility"
          break
        case "awakening":
          stageMessage = "Your consciousness is awakening to new realities"
          break
        case "growing":
          stageMessage = "You are growing into your true potential"
          break
        case "transcending":
          stageMessage = "You are transcending ordinary limitations"
          break
      }

      const engagementBonus =
        engagementLevel > 50 ? " Your deep engagement shows your readiness for transformation." : ""

      setGreeting(`${timeGreeting}. ${stageMessage}.${engagementBonus}`)
    }

    generateGreeting()
  }, [metrics])

  if (!metrics || !greeting) return null

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-4 mb-6 bg-gradient-to-r from-accent/5 to-primary/5">
      <div className="text-center">
        <p className="text-accent font-serif text-sm italic leading-relaxed">{greeting}</p>
      </div>
    </Card>
  )
}

export function AdaptiveColorTheme() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null)

  useEffect(() => {
    const handleConsciousnessUpdate = (event: CustomEvent) => {
      setMetrics(event.detail)
    }

    window.addEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)

    return () => {
      window.removeEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!metrics) return

    const adaptColors = () => {
      const { timeOfDay, transformationStage, spiritualResonance } = metrics
      const root = document.documentElement

      // Base color adjustments for time of day
      let hueShift = 0
      let saturationMultiplier = 1
      let brightnessMultiplier = 1

      switch (timeOfDay) {
        case "dawn":
          hueShift = 10 // Warmer
          saturationMultiplier = 0.9
          brightnessMultiplier = 0.95
          break
        case "morning":
          hueShift = 5
          saturationMultiplier = 1.1
          brightnessMultiplier = 1.05
          break
        case "midday":
          hueShift = 0
          saturationMultiplier = 1.2
          brightnessMultiplier = 1.1
          break
        case "afternoon":
          hueShift = -5
          saturationMultiplier = 1.1
          brightnessMultiplier = 1
          break
        case "evening":
          hueShift = 15 // Much warmer
          saturationMultiplier = 0.8
          brightnessMultiplier = 0.9
          break
        case "night":
          hueShift = 20 // Warmest
          saturationMultiplier = 0.7
          brightnessMultiplier = 0.8
          break
      }

      // Spiritual resonance affects color intensity
      const resonanceMultiplier = 1 + spiritualResonance / 200 // Max 1.5x

      // Apply color adaptations
      root.style.setProperty("--consciousness-hue-shift", `${hueShift}deg`)
      root.style.setProperty("--consciousness-saturation", `${saturationMultiplier * resonanceMultiplier}`)
      root.style.setProperty("--consciousness-brightness", `${brightnessMultiplier}`)
    }

    adaptColors()
  }, [metrics])

  return null // This is a styling component, no UI
}

export function TransformationProgress() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null)

  useEffect(() => {
    const handleConsciousnessUpdate = (event: CustomEvent) => {
      setMetrics(event.detail)
    }

    window.addEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)

    return () => {
      window.removeEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)
    }
  }, [])

  if (!metrics) return null

  const { engagementLevel, transformationStage, spiritualResonance, sessionDuration } = metrics

  const overallProgress = Math.round((engagementLevel + spiritualResonance) / 2)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "seeker":
        return "text-muted-foreground"
      case "awakening":
        return "text-primary"
      case "growing":
        return "text-accent"
      case "transcending":
        return "text-accent"
      default:
        return "text-muted-foreground"
    }
  }

  const getStageEmoji = (stage: string) => {
    switch (stage) {
      case "seeker":
        return "🌱"
      case "awakening":
        return "🌿"
      case "growing":
        return "🌳"
      case "transcending":
        return "✨"
      default:
        return "🌱"
    }
  }

  return (
    <Card className="luxury-glass-morphism border border-primary/20 p-4 mb-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">{getStageEmoji(transformationStage)}</span>
          <span
            className={`font-serif font-bold text-sm uppercase tracking-wide ${getStageColor(transformationStage)}`}
          >
            {transformationStage}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Consciousness</div>
            <div className="text-accent font-bold">{overallProgress}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Resonance</div>
            <div className="text-primary font-bold">{Math.round(spiritualResonance)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Session</div>
            <div className="text-foreground font-bold">{formatTime(sessionDuration)}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-muted-foreground/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ConsciousnessInsights() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    const handleConsciousnessUpdate = (event: CustomEvent) => {
      setMetrics(event.detail)
    }

    window.addEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)

    return () => {
      window.removeEventListener("consciousnessUpdate", handleConsciousnessUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!metrics) return

    const generateInsights = () => {
      const newInsights: string[] = []
      const {
        scrollDepth,
        logoInteractions,
        sessionDuration,
        engagementLevel,
        transformationStage,
        mouseMovements,
        clickPatterns,
        focusTime,
        interactionVelocity,
      } = metrics

      if (scrollDepth > 80) {
        newInsights.push("Your deep exploration shows a hunger for transformation")
      }

      if (logoInteractions > 5) {
        newInsights.push("Your connection with the sacred geometry reveals spiritual resonance")
      }

      if (sessionDuration > 300) {
        // 5 minutes
        newInsights.push("Your sustained presence indicates readiness for profound change")
      }

      if (engagementLevel > 70) {
        newInsights.push("Your high engagement suggests you're prepared for the next level")
      }

      if (transformationStage === "transcending") {
        newInsights.push("You are approaching a breakthrough in consciousness")
      }

      // Add stage-specific insights
      switch (transformationStage) {
        case "seeker":
          newInsights.push("Every great journey begins with a single step into the unknown")
          break
        case "awakening":
          newInsights.push("The veil is lifting - you're beginning to see new possibilities")
          break
        case "growing":
          newInsights.push("Your consciousness is expanding like ripples in still water")
          break
        case "transcending":
          newInsights.push("You are becoming the change you wish to see in the world")
          break
      }

      // Additional insights based on enhanced metrics
      if (mouseMovements > 100) {
        newInsights.push("Your active exploration suggests a curious mind")
      }

      if (clickPatterns.length > 10) {
        newInsights.push("Your varied interactions indicate a deep engagement")
      }

      if (focusTime > 600) {
        // 10 minutes
        newInsights.push("Your prolonged focus reveals a dedicated spirit")
      }

      if (interactionVelocity > 0.1) {
        newInsights.push("Your quick interactions show a responsive consciousness")
      }

      setInsights(newInsights.slice(0, 2)) // Show max 2 insights
    }

    generateInsights()
  }, [metrics])

  if (!metrics || insights.length === 0) return null

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-4 mb-6 bg-accent/5">
      <div className="text-center">
        <div className="text-accent font-serif font-bold text-sm mb-3">CONSCIOUSNESS INSIGHTS</div>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-foreground text-sm italic leading-relaxed">
              {insight}
            </p>
          ))}
        </div>
      </div>
    </Card>
  )
}
