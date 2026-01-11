"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export function ScarcityIndicator() {
  const [alphaSpots, setAlphaSpots] = useState(247)

  useEffect(() => {
    const interval = setInterval(() => {
      setAlphaSpots((prev) => Math.max(100, prev - Math.floor(Math.random() * 3)))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-accent/30 p-4 mb-6 bg-accent/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <span className="text-accent font-serif font-bold text-sm">LIMITED ALPHA ACCESS</span>
        </div>
        <div className="text-right">
          <div className="text-accent font-bold text-lg">{alphaSpots}</div>
          <div className="text-muted-foreground text-xs">spots remaining</div>
        </div>
      </div>
    </Card>
  )
}

export function SocialProofCounter() {
  const [userCount, setUserCount] = useState(12847)

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 5) + 1)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="flex -space-x-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-background flex items-center justify-center text-xs font-bold text-background"
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-accent">
          +
        </div>
      </div>
      <div className="text-center">
        <div className="text-accent font-bold text-lg">{userCount.toLocaleString()}</div>
        <div className="text-muted-foreground text-sm">visionaries joined</div>
      </div>
    </div>
  )
}

export function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 32,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Reset to create perpetual urgency
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="luxury-glass-morphism border border-primary/30 p-4 mb-6 bg-primary/5">
      <div className="text-center">
        <div className="text-primary font-serif font-bold text-sm mb-2">EARLY ACCESS ENDS IN</div>
        <div className="flex justify-center gap-2">
          <div className="bg-primary/20 rounded px-2 py-1">
            <span className="text-primary font-bold text-lg">{String(timeLeft.hours).padStart(2, "0")}</span>
            <div className="text-xs text-muted-foreground">HRS</div>
          </div>
          <div className="bg-primary/20 rounded px-2 py-1">
            <span className="text-primary font-bold text-lg">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <div className="text-xs text-muted-foreground">MIN</div>
          </div>
          <div className="bg-primary/20 rounded px-2 py-1">
            <span className="text-primary font-bold text-lg">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <div className="text-xs text-muted-foreground">SEC</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function TrustSignals() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="text-center p-3 luxury-glass-morphism rounded-lg border border-accent/20">
        <div className="text-accent font-bold text-sm">🔒</div>
        <div className="text-xs text-muted-foreground mt-1">End-to-End Encrypted</div>
      </div>
      <div className="text-center p-3 luxury-glass-morphism rounded-lg border border-accent/20">
        <div className="text-accent font-bold text-sm">⚡</div>
        <div className="text-xs text-muted-foreground mt-1">Instant Setup</div>
      </div>
      <div className="text-center p-3 luxury-glass-morphism rounded-lg border border-accent/20">
        <div className="text-accent font-bold text-sm">🌍</div>
        <div className="text-xs text-muted-foreground mt-1">Global Network</div>
      </div>
      <div className="text-center p-3 luxury-glass-morphism rounded-lg border border-accent/20">
        <div className="text-accent font-bold text-sm">💎</div>
        <div className="text-xs text-muted-foreground mt-1">Premium Quality</div>
      </div>
    </div>
  )
}

export function TestimonialCarousel() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      text: "BIZRA transformed my understanding of what's possible. In 30 days, I went from struggling freelancer to running a thriving AI-assisted consultancy.",
      author: "Sarah Chen",
      role: "AI Consultant",
      location: "Singapore",
    },
    {
      text: "The seven AI agents feel like having a genius team working 24/7. My productivity increased 10x while my stress decreased to almost zero.",
      author: "Marcus Rodriguez",
      role: "Tech Entrepreneur",
      location: "Mexico City",
    },
    {
      text: "I was skeptical about blockchain rewards, but earning BZS tokens for helping others has completely changed my perspective on work and purpose.",
      author: "Amara Okafor",
      role: "Community Builder",
      location: "Lagos",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const testimonial = testimonials[currentTestimonial]

  return (
    <Card className="luxury-glass-morphism border border-accent/20 p-6 mb-8">
      <div className="text-center">
        <div className="text-accent text-4xl mb-4">"</div>
        <p className="text-foreground italic text-lg mb-6 leading-relaxed">{testimonial.text}</p>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-background font-bold">
            {testimonial.author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="text-left">
            <div className="text-accent font-serif font-bold text-sm">{testimonial.author}</div>
            <div className="text-muted-foreground text-xs">
              {testimonial.role} • {testimonial.location}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTestimonial ? "bg-accent" : "bg-muted-foreground/30"
              }`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
