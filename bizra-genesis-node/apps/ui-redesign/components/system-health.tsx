"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from 'lucide-react'

export function SystemHealth() {
  const services = [
    { name: "Synthesis Engine", status: "operational", latency: "12ms" },
    { name: "Consensus Layer", status: "operational", latency: "45ms" },
    { name: "Agent Orchestrator", status: "operational", latency: "28ms" },
    { name: "Data Persistence", status: "operational", latency: "8ms" },
    { name: "API Gateway", status: "operational", latency: "15ms" },
  ]

  return (
    <Card className="bg-navy-900/40 border-gold-500/20 p-6">
      <h3 className="text-lg font-serif text-gold-100 mb-4">System Health Status</h3>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                service.status === "operational" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
              }`} />
              <span className="text-navy-100 group-hover:text-gold-200 transition-colors">{service.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-navy-400">{service.latency}</span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                service.status === "operational" 
                  ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {service.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
