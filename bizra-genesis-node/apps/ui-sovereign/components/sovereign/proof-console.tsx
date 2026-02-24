"use client"

import { useState } from "react"
import { useProofEngine } from "@/hooks/use-proof-engine"
import { useEventBus } from "@/hooks/use-event-bus"
import { EventTypes } from "@/lib/event-bus"
import { Lock, Play, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProofConsole() {
  const { proofs, metrics, isGenerating, generateProof } = useProofEngine()
  const { emit } = useEventBus()
  const [selectedCircuit, setSelectedCircuit] = useState("state_transition")

  const circuits = [
    { id: "state_transition", name: "State Transition", constraints: "~50K" },
    { id: "merkle_proof", name: "Merkle Proof", constraints: "~25K" },
    { id: "signature_verify", name: "Signature Verify", constraints: "~100K" },
  ]

  const handleGenerateProof = async () => {
    const publicInputs = [`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`]

    await generateProof(selectedCircuit, publicInputs)
    emit(EventTypes.PROOF_GENERATED, { circuit: selectedCircuit }, 1)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Proof Console</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-chart-4/20 text-chart-4">Groth16</span>
        </div>
      </div>

      {/* Circuit Selector */}
      <div className="px-4 py-3 border-b border-border">
        <div className="font-mono text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Select Circuit</div>
        <div className="flex gap-2">
          {circuits.map((circuit) => (
            <button
              key={circuit.id}
              onClick={() => setSelectedCircuit(circuit.id)}
              className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                selectedCircuit === circuit.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {circuit.name}
              <span className="ml-1 opacity-60">{circuit.constraints}</span>
            </button>
          ))}
        </div>

        <Button onClick={handleGenerateProof} disabled={isGenerating} className="mt-3 w-full h-8 font-mono text-xs">
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Generating Proof...
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-2" />
              Generate Proof
            </>
          )}
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-border">
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-foreground">{metrics?.totalProofs ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-accent">{metrics?.verifiedProofs ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Verified</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-semibold text-destructive">{metrics?.failedProofs ?? 0}</div>
          <div className="font-mono text-[10px] text-muted-foreground">Failed</div>
        </div>
      </div>

      {/* Proof List */}
      <div className="flex-1 overflow-y-auto">
        {proofs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            No proofs generated yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {proofs.map((proof) => (
              <div key={proof.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {proof.status === "verified" ? (
                      <CheckCircle className="h-4 w-4 text-accent" />
                    ) : proof.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-chart-3 animate-pulse" />
                    )}
                    <span className="font-mono text-xs text-foreground">{proof.circuitId}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date(proof.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-mono text-[10px] text-muted-foreground truncate">
                  {proof.proof.slice(0, 64)}...
                </div>

                {proof.status === "verified" && (
                  <div className="mt-1 font-mono text-[10px] text-accent">
                    Verified in {proof.verificationTime.toFixed(1)}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/50">
        <span className="font-mono text-[10px] text-muted-foreground">
          Avg Gen: {metrics?.avgGenerationTimeMs ?? 0}ms
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          Avg Verify: {metrics?.avgVerificationTimeMs ?? 0}ms
        </span>
      </div>
    </div>
  )
}
