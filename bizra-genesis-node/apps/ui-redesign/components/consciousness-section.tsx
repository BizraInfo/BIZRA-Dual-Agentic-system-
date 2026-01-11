"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ConsciousnessSectionProps {
  title: string
  description: string
  features: string[]
  ctaText: string
  variant?: "primary" | "secondary"
}

export function ConsciousnessSection({
  title,
  description,
  features,
  ctaText,
  variant = "primary",
}: ConsciousnessSectionProps) {
  return (
    <Card
      className={`
      relative overflow-hidden p-8 md:p-12 
      ${variant === "primary" ? "consciousness-gradient" : "bg-card/50 backdrop-blur-sm"}
      border-primary/20 hover:border-primary/40 transition-all duration-700
      group hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10
    `}
    >
      <div className="relative z-10">
        <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-foreground group-hover:text-primary transition-colors duration-500">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">{description}</p>
        <div className="grid gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 group/feature"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-foreground group-hover/feature:text-primary transition-colors duration-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
        <Button
          size="lg"
          className={`
            ${variant === "primary" ? "bg-primary hover:bg-primary/90" : "bg-accent hover:bg-accent/90"}
            text-white font-heading font-semibold px-8 py-6 text-lg
            transform hover:scale-105 transition-all duration-300
            shadow-lg hover:shadow-xl
          `}
        >
          {ctaText}
        </Button>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-4 right-4 w-16 h-16 border border-primary rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute bottom-4 left-4 w-12 h-12 border border-accent rounded-full animate-spin"
          style={{ animationDuration: "15s", animationDirection: "reverse" }}
        />
      </div>
    </Card>
  )
}
