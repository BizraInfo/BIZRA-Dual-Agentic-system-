"use client"

import { useState } from "react"
import { Binary, ChevronRight, FileCode, GitBranch, Hash, Lock, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface Circuit {
  id: string
  name: string
  constraints: number
  publicInputs: number
  privateInputs: number
  provingTime: string
  verifyTime: string
  proofSize: string
  status: "active" | "deprecated" | "experimental"
}

const circuits: Circuit[] = [
  {
    id: "state_transition_v1",
    name: "State Transition",
    constraints: 50000,
    publicInputs: 4,
    privateInputs: 12,
    provingTime: "~80ms",
    verifyTime: "~25ms",
    proofSize: "192B",
    status: "active",
  },
  {
    id: "merkle_proof_v2",
    name: "Merkle Proof",
    constraints: 25000,
    publicInputs: 2,
    privateInputs: 256,
    provingTime: "~45ms",
    verifyTime: "~15ms",
    proofSize: "192B",
    status: "active",
  },
  {
    id: "signature_verify_v1",
    name: "Signature Verify",
    constraints: 100000,
    publicInputs: 3,
    privateInputs: 64,
    provingTime: "~150ms",
    verifyTime: "~30ms",
    proofSize: "192B",
    status: "active",
  },
  {
    id: "ihsan_compliance_v1",
    name: "Ihsan Compliance",
    constraints: 35000,
    publicInputs: 5,
    privateInputs: 8,
    provingTime: "~60ms",
    verifyTime: "~20ms",
    proofSize: "192B",
    status: "experimental",
  },
  {
    id: "batch_aggregator_v1",
    name: "Batch Aggregator",
    constraints: 200000,
    publicInputs: 16,
    privateInputs: 128,
    provingTime: "~300ms",
    verifyTime: "~40ms",
    proofSize: "256B",
    status: "experimental",
  },
]

export function CircuitBrowser() {
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null)
  const [expandedCircuit, setExpandedCircuit] = useState<string | null>("state_transition_v1")

  const selected = circuits.find((c) => c.id === selectedCircuit)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Binary className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Circuit Browser</h2>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">Groth16 / BN254</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Circuit List */}
        <div className="w-64 border-r border-border overflow-y-auto">
          <div className="p-2">
            {circuits.map((circuit) => (
              <div key={circuit.id} className="mb-1">
                <button
                  onClick={() => {
                    setSelectedCircuit(circuit.id)
                    setExpandedCircuit(expandedCircuit === circuit.id ? null : circuit.id)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md font-mono text-xs transition-colors",
                    selectedCircuit === circuit.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <FileCode className="h-4 w-4" />
                  <span className="flex-1 text-left">{circuit.name}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] uppercase",
                      circuit.status === "active"
                        ? "bg-accent/20 text-accent"
                        : circuit.status === "experimental"
                          ? "bg-chart-3/20 text-chart-3"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {circuit.status}
                  </span>
                  <ChevronRight
                    className={cn("h-3 w-3 transition-transform", expandedCircuit === circuit.id && "rotate-90")}
                  />
                </button>

                {expandedCircuit === circuit.id && (
                  <div className="ml-6 mt-1 p-2 bg-muted/30 rounded text-[10px] font-mono text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Constraints:</span>
                      <span className="text-foreground">{circuit.constraints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proving:</span>
                      <span className="text-foreground">{circuit.provingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verify:</span>
                      <span className="text-foreground">{circuit.verifyTime}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Circuit Details */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selected ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="font-mono text-lg font-semibold text-foreground">{selected.name}</h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] uppercase font-mono",
                      selected.status === "active"
                        ? "bg-accent/20 text-accent"
                        : selected.status === "experimental"
                          ? "bg-chart-3/20 text-chart-3"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{selected.id}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="h-4 w-4 text-chart-1" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Constraints</span>
                  </div>
                  <span className="font-mono text-xl font-semibold text-foreground">
                    {(selected.constraints / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-4 w-4 text-chart-2" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Proving Time</span>
                  </div>
                  <span className="font-mono text-xl font-semibold text-foreground">{selected.provingTime}</span>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-chart-3" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Proof Size</span>
                  </div>
                  <span className="font-mono text-xl font-semibold text-foreground">{selected.proofSize}</span>
                </div>
              </div>

              {/* I/O Specification */}
              <div className="p-4 bg-card border border-border rounded-lg">
                <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Input/Output Specification
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground mb-2">Public Inputs</div>
                    <div className="space-y-1">
                      {Array.from({ length: selected.publicInputs }, (_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <span className="font-mono text-xs text-foreground">input_{i}: Field</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground mb-2">
                      Private Witness ({selected.privateInputs} signals)
                    </div>
                    <div className="p-2 bg-muted/30 rounded font-mono text-[10px] text-muted-foreground">
                      witness[0..{selected.privateInputs - 1}]: Field[]
                    </div>
                  </div>
                </div>
              </div>

              {/* R1CS Visualization */}
              <div className="p-4 bg-card border border-border rounded-lg">
                <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  R1CS Constraint System
                </h4>
                <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold text-primary mb-1">A · B = C</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {selected.constraints.toLocaleString()} constraint equations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
              Select a circuit to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
