"use client"

import type React from "react"

import { useState } from "react"
import { Network, Activity, Shield, Brain, Settings, ChevronRight, Cpu, Lock, Sparkles, BookOpen, Gauge, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { SeedOfLife } from "./seed-of-life"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: string
  children?: { id: string; label: string }[]
}

const navItems: NavItem[] = [
  {
    id: "genesis",
    label: "Genesis Story",
    icon: BookOpen,
    badge: "البذرة",
    children: [
      { id: "genesis-story", label: "The Story" },
      { id: "semiotics", label: "Sacred Geometry" },
      { id: "principles", label: "Principles" },
    ],
  },
  {
    id: "overview",
    label: "Overview",
    icon: Activity,
  },
  {
    id: "state-dag",
    label: "State DAG",
    icon: Network,
    badge: "LIVE",
    children: [
      { id: "dag-visualizer", label: "DAG Visualizer" },
      { id: "merkle-explorer", label: "Merkle Explorer" },
      { id: "state-history", label: "State History" },
    ],
  },
  {
    id: "event-system",
    label: "Event System",
    icon: Cpu,
    children: [
      { id: "event-stream", label: "Event Stream" },
      { id: "latency-monitor", label: "Latency Monitor" },
      { id: "queue-inspector", label: "Queue Inspector" },
    ],
  },
  {
    id: "proof-layer",
    label: "Proof Layer",
    icon: Lock,
    badge: "ZK",
    children: [
      { id: "proof-generator", label: "Proof Generator" },
      { id: "verification-log", label: "Verification Log" },
      { id: "circuit-browser", label: "Circuit Browser" },
    ],
  },
  {
    id: "ai-engine",
    label: "AI Engine",
    icon: Brain,
    badge: "R1",
    children: [
      { id: "optimization-telemetry", label: "Optimization Telemetry" },
      { id: "rewrite-history", label: "Rewrite History" },
      { id: "model-config", label: "Model Config" },
    ],
  },
  {
    id: "auditor",
    label: "Auditor Core",
    icon: Shield,
    badge: "OMEGA",
    children: [
      { id: "third-fact-auditor", label: "Third Fact Auditor" },
      { id: "metrics-dashboard", label: "Metrics Dashboard" },
      { id: "violation-log", label: "Violation Log" },
      { id: "constraint-editor", label: "Constraint Editor" },
    ],
  },
  {
    id: "cognitive",
    label: "Cognitive Center",
    icon: Gauge,
    badge: "SNR",
    children: [
      { id: "snr-monitor", label: "SNR Monitor" },
      { id: "thought-graph", label: "Thought Graph" },
      { id: "ihsan-radar", label: "Ihsan Radar" },
    ],
  },
  {
    id: "money-shot",
    label: "Investor Theater",
    icon: ExternalLink,
    badge: "LIVE",
  },
]

interface SovereignSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SovereignSidebar({ activeSection, onSectionChange }: SovereignSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["genesis"]))

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <SeedOfLife size={32} animated={false} />
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#C9A962]">BIZRA</h1>
            <p className="font-arabic text-xs text-muted-foreground">البذرة</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-sidebar-accent rounded px-2 py-1">
            <div className="font-mono text-[10px] text-muted-foreground">IHSAN</div>
            <div className="font-mono text-sm text-accent">0.99</div>
          </div>
          <div className="bg-sidebar-accent rounded px-2 py-1">
            <div className="font-mono text-[10px] text-muted-foreground">VERIFIED</div>
            <div className="font-mono text-sm text-[#C9A962]">99.8%</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <div key={item.id} className="mb-1">
            <button
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.id)
                }
                onSectionChange(item.id)
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md font-mono text-sm transition-colors",
                activeSection === item.id || activeSection.startsWith(item.id)
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px]",
                    item.id === "genesis" ? "bg-[#C9A962]/20 text-[#C9A962] font-arabic" : "bg-primary/20 text-primary",
                  )}
                >
                  {item.badge}
                </span>
              )}
              {item.children && (
                <ChevronRight
                  className={cn("h-3 w-3 transition-transform", expandedItems.has(item.id) && "rotate-90")}
                />
              )}
            </button>

            {item.children && expandedItems.has(item.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onSectionChange(child.id)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded font-mono text-xs transition-colors",
                      activeSection === child.id
                        ? "text-[#C9A962] bg-sidebar-accent"
                        : "text-muted-foreground hover:text-sidebar-foreground",
                    )}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* AI Status Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#C9A962]" />
          <span className="font-mono text-xs text-sidebar-foreground">DeepSeek-R1</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">Last optimization: 2.4s ago</div>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md font-mono text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}
