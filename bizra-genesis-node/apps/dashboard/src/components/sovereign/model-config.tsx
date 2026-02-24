"use client"

import { useState } from "react"
import { useAIEngine } from "@/hooks/use-ai-engine"
import { Settings, Brain, Cpu, Thermometer, Sliders, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface ConfigOption {
  id: string
  label: string
  description: string
  type: "slider" | "toggle"
  min?: number
  max?: number
  step?: number
  unit?: string
}

const configOptions: ConfigOption[] = [
  {
    id: "confidenceThreshold",
    label: "Confidence Threshold",
    description: "Minimum confidence score required for auto-deployment",
    type: "slider",
    min: 0.5,
    max: 0.99,
    step: 0.01,
  },
  {
    id: "maxLinesChanged",
    label: "Max Lines Changed",
    description: "Maximum lines of code that can be modified per optimization",
    type: "slider",
    min: 10,
    max: 500,
    step: 10,
    unit: "lines",
  },
  {
    id: "testingDuration",
    label: "A/B Testing Duration",
    description: "Duration of shadow testing before deployment",
    type: "slider",
    min: 1000,
    max: 10000,
    step: 500,
    unit: "ms",
  },
  {
    id: "rollbackThreshold",
    label: "Rollback Threshold",
    description: "Performance regression threshold triggering auto-rollback",
    type: "slider",
    min: 0.01,
    max: 0.2,
    step: 0.01,
  },
]

export function ModelConfig() {
  const { metrics } = useAIEngine()
  const [config, setConfig] = useState({
    confidenceThreshold: 0.85,
    maxLinesChanged: 100,
    testingDuration: 3000,
    rollbackThreshold: 0.05,
  })

  const handleConfigChange = (id: string, value: number) => {
    setConfig((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Model Configuration</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Model Info */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-chart-4/20 flex items-center justify-center">
              <Brain className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <div className="font-mono text-sm font-semibold text-foreground">{metrics?.modelVersion}</div>
              <div className="font-mono text-[10px] text-muted-foreground">7B parameters | Quantized INT8</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-chart-1" />
              <div>
                <div className="font-mono text-xs text-foreground">~45ms</div>
                <div className="font-mono text-[10px] text-muted-foreground">Inference</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-chart-3" />
              <div>
                <div className="font-mono text-xs text-foreground">0.7</div>
                <div className="font-mono text-[10px] text-muted-foreground">Temperature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sliders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Optimization Parameters
            </span>
          </div>

          {configOptions.map((option) => (
            <div key={option.id} className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-foreground">{option.label}</span>
                <span className="font-mono text-xs text-primary">
                  {config[option.id as keyof typeof config]}
                  {option.unit ? ` ${option.unit}` : ""}
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mb-3">{option.description}</p>
              <Slider
                value={[config[option.id as keyof typeof config]]}
                onValueChange={([value]) => handleConfigChange(option.id, value)}
                min={option.min}
                max={option.max}
                step={option.step}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Constraint Boundaries */}
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Constraint Boundaries
          </div>
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">No semantic changes</span>
              <span className="text-accent">ENFORCED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deterministic replay</span>
              <span className="text-accent">ENFORCED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Human override threshold</span>
              <span className="text-foreground">100 LOC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ihsan compliance required</span>
              <span className="text-accent">ALWAYS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <Button variant="outline" className="flex-1 h-8 font-mono text-xs bg-transparent">
          <RotateCcw className="h-3 w-3 mr-2" />
          Reset Defaults
        </Button>
        <Button className="flex-1 h-8 font-mono text-xs">
          <Save className="h-3 w-3 mr-2" />
          Save Config
        </Button>
      </div>
    </div>
  )
}
