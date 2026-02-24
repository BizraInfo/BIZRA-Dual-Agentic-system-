"use client"

import { useEffect, useState } from "react"
import { useProofEngine } from "@/hooks/use-proof-engine"
import { CheckCircle, XCircle, Clock, Shield, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VerificationEntry {
  id: string
  proofId: string
  circuitId: string
  timestamp: number
  status: "verified" | "failed" | "pending"
  verificationTime: number
  gasEstimate: number
  onChainTx?: string
}

export function VerificationLog() {
  const { proofs } = useProofEngine()
  const [entries, setEntries] = useState<VerificationEntry[]>([])
  const [filter, setFilter] = useState<"all" | "verified" | "failed">("all")

  useEffect(() => {
    // Convert proofs to verification entries
    const newEntries: VerificationEntry[] = proofs.map((proof) => ({
      id: `ver_${proof.id}`,
      proofId: proof.id,
      circuitId: proof.circuitId,
      timestamp: proof.timestamp,
      status: proof.status,
      verificationTime: proof.verificationTime,
      gasEstimate: 180000 + Math.floor(Math.random() * 20000),
      onChainTx: proof.status === "verified" ? `0x${proof.proof.slice(0, 64)}` : undefined,
    }))
    setEntries(newEntries)
  }, [proofs])

  const filteredEntries = entries.filter((entry) => {
    if (filter === "all") return true
    return entry.status === filter
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm text-foreground">Verification Log</h2>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "verified", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded font-mono text-[10px] uppercase transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs text-foreground">
            {entries.filter((e) => e.status === "verified").length}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">verified</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-destructive" />
          <span className="font-mono text-xs text-foreground">
            {entries.filter((e) => e.status === "failed").length}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">failed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-chart-3" />
          <span className="font-mono text-xs text-foreground">
            {entries.filter((e) => e.status === "pending").length}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">pending</span>
        </div>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            No verification entries
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.status === "verified" ? (
                      <CheckCircle className="h-4 w-4 text-accent" />
                    ) : entry.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-chart-3 animate-pulse" />
                    )}
                    <span className="font-mono text-xs text-foreground">{entry.circuitId}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-[10px] font-mono">
                  <div>
                    <span className="text-muted-foreground">Proof ID: </span>
                    <span className="text-foreground">{entry.proofId.slice(0, 16)}...</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verify Time: </span>
                    <span className="text-foreground">{entry.verificationTime.toFixed(1)}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gas Est: </span>
                    <span className="text-foreground">{entry.gasEstimate.toLocaleString()}</span>
                  </div>
                </div>

                {entry.onChainTx && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">TX:</span>
                    <code className="font-mono text-[10px] text-chart-1 bg-muted/50 px-1 rounded">
                      {entry.onChainTx.slice(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => copyToClipboard(entry.onChainTx!)}
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/50">
        <span className="font-mono text-[10px] text-muted-foreground">Total: {entries.length} verifications</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          Success Rate:{" "}
          {entries.length > 0
            ? ((entries.filter((e) => e.status === "verified").length / entries.length) * 100).toFixed(1)
            : 0}
          %
        </span>
      </div>
    </div>
  )
}
