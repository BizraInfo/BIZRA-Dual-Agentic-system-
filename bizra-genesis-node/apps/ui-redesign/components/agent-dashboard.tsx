"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Cpu, Terminal, Search, Play, Pause, RefreshCw } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { wsManager } from "@/lib/websocket-manager"

interface Agent {
  id: string
  name: string
  type: "PAT" | "SAT"
  status: "active" | "idle" | "processing" | "offline"
  uptime: string
  load: number
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([
    { id: "ag_1", name: "Genesis Prime", type: "PAT", status: "active", uptime: "99.9%", load: 45 },
    { id: "ag_2", name: "Network Sentinel", type: "SAT", status: "processing", uptime: "99.5%", load: 82 },
    { id: "ag_3", name: "Data Harvester", type: "SAT", status: "idle", uptime: "98.2%", load: 12 },
    { id: "ag_4", name: "Consensus Validator", type: "PAT", status: "active", uptime: "100%", load: 65 },
  ])
  const [command, setCommand] = useState("")
  const [logs, setLogs] = useState<string[]>([
    "> System initialized",
    "> Connected to Genesis Node",
    "> 4 Agents detected online"
  ])

  useEffect(() => {
    // Subscribe to agent updates
    wsManager.subscribe("agent_update", (data) => {
      setAgents(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a))
    })

    return () => {
      wsManager.unsubscribe("agent_update", () => {})
    }
  }, [])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    const newLog = `> ${command}`
    setLogs(prev => [...prev, newLog, `Processing command: ${command}...`])
    setCommand("")

    // Simulate response
    setTimeout(() => {
      setLogs(prev => [...prev, `Command executed successfully.`])
    }, 800)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Agent Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif text-gold-100">Active Agents</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input 
                placeholder="Search agents..." 
                className="pl-9 bg-navy-900/50 border-gold-500/20 text-gold-100 w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="border-gold-500/20 text-gold-400 hover:bg-gold-500/10">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-navy-900/40 border-gold-500/20 p-4 hover:border-gold-500/40 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    agent.type === "PAT" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gold-100">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-navy-300">
                      <span className="font-mono">{agent.id}</span>
                      <span>•</span>
                      <span className="font-mono">{agent.type}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`
                  ${agent.status === "active" ? "border-green-500/50 text-green-400 bg-green-500/5" : ""}
                  ${agent.status === "processing" ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/5" : ""}
                  ${agent.status === "idle" ? "border-navy-500/50 text-navy-400 bg-navy-500/5" : ""}
                `}>
                  {agent.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-300">System Load</span>
                  <span className="text-gold-200 font-mono">{agent.load}%</span>
                </div>
                <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-500"
                    style={{ width: `${agent.load}%` }}
                  />
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-gold-500/10">
                  <Button size="sm" variant="ghost" className="flex-1 hover:bg-gold-500/10 hover:text-gold-300">
                    <Play className="w-3 h-3 mr-2" /> Start
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 hover:bg-gold-500/10 hover:text-gold-300">
                    <Pause className="w-3 h-3 mr-2" /> Pause
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 hover:bg-gold-500/10 hover:text-gold-300">
                    <Activity className="w-3 h-3 mr-2" /> Logs
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Command Terminal */}
      <div className="lg:col-span-1">
        <Card className="h-full bg-black/40 border-gold-500/20 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gold-500/20 bg-navy-950/50 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-mono text-gold-200">System Console</span>
          </div>
          
          <ScrollArea className="flex-1 p-4 font-mono text-xs space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="text-gold-100/80 break-words">
                {log}
              </div>
            ))}
          </ScrollArea>

          <div className="p-3 border-t border-gold-500/20 bg-navy-950/50">
            <form onSubmit={handleCommand} className="flex gap-2">
              <span className="text-gold-500 font-mono pt-2">{">"}</span>
              <Input 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 text-gold-100 font-mono h-9"
                placeholder="Enter command..."
              />
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
