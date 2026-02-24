"use client"

import { useState } from "react"
import { SovereignHeader } from "./header"
import { SovereignSidebar } from "./sidebar"
import { DAGVisualizer } from "./dag-visualizer"
import { MetricsPanel } from "./metrics-panel"
import { EventStream } from "./event-stream"
import { ProofConsole } from "./proof-console"
import { LatencyMonitor } from "./latency-monitor"
import { PerformanceHUD } from "./performance-hud"
import { QueueInspector } from "./queue-inspector"
import { CircuitBrowser } from "./circuit-browser"
import { VerificationLog } from "./verification-log"
import { ProofVisualizer } from "./proof-visualizer"
import { AITelemetry } from "./ai-telemetry"
import { RewriteHistory } from "./rewrite-history"
import { ModelConfig } from "./model-config"
import { IhsanDashboard } from "./ihsan-dashboard"
import { GenesisStory } from "./genesis-story"
import { ThirdFactAuditor } from "../auditor/ThirdFactAuditor"

export function SovereignDashboard() {
  const [activeSection, setActiveSection] = useState("genesis-story")

  const getMainView = () => {
    switch (activeSection) {
      case "genesis":
      case "genesis-story":
      case "semiotics":
      case "principles":
        return <GenesisStory />
      case "third-fact-auditor":
        return <ThirdFactAuditor />
      case "circuit-browser":
        return <CircuitBrowser />
      case "verification-log":
        return <VerificationLog />
      case "proof-generator":
        return <ProofVisualizer />
      case "optimization-telemetry":
        return <AITelemetry />
      case "rewrite-history":
        return <RewriteHistory />
      case "model-config":
        return <ModelConfig />
      case "metrics-dashboard":
        return <IhsanDashboard />
      default:
        return <DAGVisualizer />
    }
  }

  const getSecondaryPanels = () => {
    if (activeSection.startsWith("genesis") || activeSection === "semiotics" || activeSection === "principles") {
      return null
    }

    switch (activeSection) {
      case "latency-monitor":
        return (
          <div className="h-64 border-t border-border">
            <LatencyMonitor />
          </div>
        )
      case "queue-inspector":
        return (
          <div className="h-64 border-t border-border">
            <QueueInspector />
          </div>
        )
      case "event-stream":
        return (
          <div className="h-64 border-t border-border">
            <EventStream />
          </div>
        )
      case "optimization-telemetry":
      case "rewrite-history":
      case "model-config":
        return (
          <div className="h-64 border-t border-border flex">
            <div className="flex-1 border-r border-border">
              <EventStream />
            </div>
            <div className="w-96">
              <AITelemetry />
            </div>
          </div>
        )
      default:
        return (
          <div className="h-64 border-t border-border flex">
            <div className="flex-1 border-r border-border">
              <EventStream />
            </div>
            <div className="w-80">
              <ProofConsole />
            </div>
          </div>
        )
    }
  }

  const getRightPanel = () => {
    if (activeSection.startsWith("genesis") || activeSection === "semiotics" || activeSection === "principles") {
      return null
    }

    if (
      activeSection === "latency-monitor" ||
      activeSection === "event-stream" ||
      activeSection === "queue-inspector"
    ) {
      return <PerformanceHUD />
    }
    if (
      activeSection === "optimization-telemetry" ||
      activeSection === "rewrite-history" ||
      activeSection === "model-config"
    ) {
      return (
        <div className="h-full p-4">
          <IhsanDashboard />
        </div>
      )
    }
    return <MetricsPanel />
  }

  const isGenesisView =
    activeSection.startsWith("genesis") || 
    activeSection === "semiotics" || 
    activeSection === "principles" ||
    activeSection === "third-fact-auditor"

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <SovereignHeader />

      <div className="flex-1 flex overflow-hidden">
        <SovereignSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Primary View - Dynamic based on section */}
            <div className="flex-1 min-h-0">{getMainView()}</div>

            {/* Secondary Views - Dynamic based on section */}
            {getSecondaryPanels()}
          </div>

          {/* Right Panel - Dynamic (hidden for genesis view) */}
          {!isGenesisView && <aside className="w-80 border-l border-border overflow-y-auto">{getRightPanel()}</aside>}
        </main>
      </div>
    </div>
  )
}
