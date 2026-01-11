"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const GenesisNodeDashboard: React.FC = () => {
  const [nodeStatus, setNodeStatus] = useState<"initializing" | "active" | "scaling" | "optimizing">("initializing")
  const [clusterMetrics, setClusterMetrics] = useState({
    totalNodes: 1,
    activeContainers: 7,
    cpuUsage: 23.4,
    memoryUsage: 45.7,
    networkThroughput: 1247,
    aiAgentsDeployed: 7,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setClusterMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.max(15, Math.min(85, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        networkThroughput: Math.max(800, Math.min(2000, prev.networkThroughput + (Math.random() - 0.5) * 100)),
        totalNodes: Math.max(1, prev.totalNodes + Math.floor(Math.random() * 3) - 1),
      }))

      // Cycle through node statuses
      const statuses: (typeof nodeStatus)[] = ["initializing", "active", "scaling", "optimizing"]
      const currentIndex = statuses.indexOf(nodeStatus)
      const nextIndex = (currentIndex + 1) % statuses.length
      if (Math.random() < 0.3) {
        setNodeStatus(statuses[nextIndex])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [nodeStatus])

  const getStatusColor = (status: typeof nodeStatus) => {
    switch (status) {
      case "initializing":
        return "text-blue-400"
      case "active":
        return "text-green-400"
      case "scaling":
        return "text-purple-400"
      case "optimizing":
        return "text-gold"
      default:
        return "text-white"
    }
  }

  const getStatusBg = (status: typeof nodeStatus) => {
    switch (status) {
      case "initializing":
        return "bg-blue-500/80"
      case "active":
        return "bg-green-500/80"
      case "scaling":
        return "bg-purple-500/80"
      case "optimizing":
        return "bg-gold/80"
      default:
        return "bg-white/80"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-8">
      <div className="text-center mb-8">
        <div className="relative mx-auto w-40 h-40 mb-6">
          {/* Node Core Visualization */}
          <div className="absolute inset-0 rounded-full border-4 border-gold animate-spin-slow">
            <div className="absolute inset-4 rounded-full border-2 border-blue-400 animate-reverse-spin">
              <div className="absolute inset-4 rounded-full border border-purple-400 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl animate-pulse">⚡</div>
                </div>
              </div>
            </div>
          </div>

          {/* Orbiting Nodes */}
          {[...Array(clusterMetrics.totalNodes)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-gold rounded-full animate-orbit"
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: "4s",
              }}
            />
          ))}
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">GENESIS NODE CLUSTER</h3>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white ${getStatusBg(nodeStatus)}`}
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
          {nodeStatus.toUpperCase()}
        </div>
      </div>

      {/* Cluster Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-gold">{clusterMetrics.totalNodes}</div>
          <div className="text-sm text-white/60">Active Nodes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">{clusterMetrics.activeContainers}</div>
          <div className="text-sm text-white/60">Containers</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{clusterMetrics.cpuUsage.toFixed(1)}%</div>
          <div className="text-sm text-white/60">CPU Usage</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">{clusterMetrics.memoryUsage.toFixed(1)}%</div>
          <div className="text-sm text-white/60">Memory</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{clusterMetrics.networkThroughput}</div>
          <div className="text-sm text-white/60">MB/s Network</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">{clusterMetrics.aiAgentsDeployed}</div>
          <div className="text-sm text-white/60">AI Agents</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3">SCALE CLUSTER</Button>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3">OPTIMIZE RESOURCES</Button>
      </div>
    </Card>
  )
}

export const ContainerizedServices: React.FC = () => {
  const [services, setServices] = useState([
    { name: "Master Reasoner", status: "running", cpu: 15.3, memory: 234, replicas: 3 },
    { name: "Memory Architect", status: "running", cpu: 8.7, memory: 156, replicas: 2 },
    { name: "Creative Synthesizer", status: "scaling", cpu: 22.1, memory: 312, replicas: 4 },
    { name: "Data Analyst", status: "running", cpu: 12.4, memory: 189, replicas: 2 },
    { name: "Communication Expert", status: "running", cpu: 6.8, memory: 98, replicas: 1 },
    { name: "Strategic Planner", status: "optimizing", cpu: 18.9, memory: 267, replicas: 3 },
    { name: "Ethics Guardian", status: "running", cpu: 4.2, memory: 87, replicas: 1 },
  ])

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/80 text-white"
      case "scaling":
        return "bg-blue-500/80 text-white"
      case "optimizing":
        return "bg-gold/80 text-black"
      case "error":
        return "bg-red-500/80 text-white"
      default:
        return "bg-gray-500/80 text-white"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">CONTAINERIZED AI SERVICES</h3>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex-1">
              <div className="font-semibold text-white">{service.name}</div>
              <div className="text-sm text-white/60">
                CPU: {service.cpu}% • Memory: {service.memory}MB • Replicas: {service.replicas}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getServiceStatusColor(service.status)}`}>
                {service.status.toUpperCase()}
              </div>
              <Button size="sm" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 bg-transparent">
                MANAGE
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex space-x-4">
        <Button className="flex-1 bg-gold hover:bg-gold/80 text-black font-bold">DEPLOY NEW SERVICE</Button>
        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 bg-transparent">
          AUTO-SCALE
        </Button>
      </div>
    </Card>
  )
}

export const DistributedComputingNetwork: React.FC = () => {
  const [networkNodes, setNetworkNodes] = useState([
    { id: 1, location: "Local Node", status: "primary", connections: 6, tflops: 2.4 },
    { id: 2, location: "Edge Node A", status: "active", connections: 3, tflops: 1.8 },
    { id: 3, location: "Edge Node B", status: "active", connections: 4, tflops: 2.1 },
    { id: 4, location: "Cloud Node", status: "standby", connections: 2, tflops: 3.2 },
    { id: 5, location: "Peer Node", status: "active", connections: 5, tflops: 1.6 },
  ])

  const [totalTflops, setTotalTflops] = useState(0)

  useEffect(() => {
    const total = networkNodes.reduce((sum, node) => sum + node.tflops, 0)
    setTotalTflops(total)
  }, [networkNodes])

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "primary":
        return "text-gold"
      case "active":
        return "text-green-400"
      case "standby":
        return "text-blue-400"
      case "offline":
        return "text-red-400"
      default:
        return "text-white"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">DISTRIBUTED COMPUTING NETWORK</h3>

      <div className="mb-6 text-center">
        <div className="text-4xl font-bold text-gold mb-2">{totalTflops.toFixed(1)} TFLOPS</div>
        <div className="text-sm text-white/60">Total Network Computing Power</div>
      </div>

      <div className="space-y-4 mb-6">
        {networkNodes.map((node) => (
          <div key={node.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getNodeStatusColor(node.status)} animate-pulse`} />
              <div>
                <div className="font-semibold text-white">{node.location}</div>
                <div className="text-xs text-white/60">{node.connections} connections</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white">{node.tflops} TFLOPS</div>
              <div className={`text-xs ${getNodeStatusColor(node.status)}`}>{node.status.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold">ADD NODE</Button>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold">OPTIMIZE NETWORK</Button>
      </div>
    </Card>
  )
}

export const KubernetesClusterMonitor: React.FC = () => {
  const [clusterHealth, setClusterHealth] = useState({
    masterNodes: 1,
    workerNodes: 3,
    totalPods: 21,
    runningPods: 19,
    pendingPods: 2,
    failedPods: 0,
    namespaces: 4,
    services: 12,
  })

  const healthPercentage = ((clusterHealth.runningPods / clusterHealth.totalPods) * 100).toFixed(1)

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">KUBERNETES CLUSTER STATUS</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{clusterHealth.masterNodes}</div>
          <div className="text-xs text-white/60">Master Nodes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{clusterHealth.workerNodes}</div>
          <div className="text-xs text-white/60">Worker Nodes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{clusterHealth.runningPods}</div>
          <div className="text-xs text-white/60">Running Pods</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{clusterHealth.services}</div>
          <div className="text-xs text-white/60">Services</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-semibold">Cluster Health</span>
          <span className="text-green-400 font-bold">{healthPercentage}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-gold h-3 rounded-full transition-all duration-1000"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
          SCALE UP
        </Button>
        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
          ROLLING UPDATE
        </Button>
        <Button size="sm" className="bg-gold hover:bg-gold/80 text-black">
          MONITOR LOGS
        </Button>
      </div>
    </Card>
  )
}
