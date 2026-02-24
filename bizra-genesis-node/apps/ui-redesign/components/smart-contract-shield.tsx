"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const SmartContractShieldDashboard: React.FC = () => {
  const [shieldStatus, setShieldStatus] = useState<"scanning" | "protected" | "validating" | "optimizing">("scanning")
  const [securityMetrics, setSecurityMetrics] = useState({
    contractsScanned: 247,
    vulnerabilitiesBlocked: 0,
    transactionsSecured: 15847,
    complianceScore: 99.8,
    gasOptimization: 34.2,
    multiSigActive: true,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityMetrics((prev) => ({
        ...prev,
        contractsScanned: prev.contractsScanned + Math.floor(Math.random() * 3),
        transactionsSecured: prev.transactionsSecured + Math.floor(Math.random() * 10),
        complianceScore: Math.max(95, Math.min(100, prev.complianceScore + (Math.random() - 0.5) * 0.1)),
        gasOptimization: Math.max(20, Math.min(50, prev.gasOptimization + (Math.random() - 0.5) * 2)),
      }))

      // Cycle through shield statuses
      const statuses: (typeof shieldStatus)[] = ["scanning", "protected", "validating", "optimizing"]
      const currentIndex = statuses.indexOf(shieldStatus)
      const nextIndex = (currentIndex + 1) % statuses.length
      if (Math.random() < 0.25) {
        setShieldStatus(statuses[nextIndex])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [shieldStatus])

  const getShieldColor = (status: typeof shieldStatus) => {
    switch (status) {
      case "scanning":
        return "text-blue-400"
      case "protected":
        return "text-green-400"
      case "validating":
        return "text-gold"
      case "optimizing":
        return "text-purple-400"
      default:
        return "text-white"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-8">
      <div className="text-center mb-8">
        <div className="relative mx-auto w-36 h-36 mb-6">
          {/* Shield Core */}
          <div className="absolute inset-0 rounded-full border-4 border-gold animate-pulse">
            <div className="absolute inset-2 rounded-full border-2 border-blue-400 animate-spin">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gold/20 to-blue-400/20 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-5xl transition-all duration-500 ${getShieldColor(shieldStatus)}`}>🛡️</div>
                </div>
              </div>
            </div>
          </div>

          {/* Orbiting Security Layers */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-400 rounded-full animate-orbit"
              style={{
                animationDelay: `${i * 0.7}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">SMART CONTRACT SHIELD</h3>
        <div className={`text-lg font-bold ${getShieldColor(shieldStatus)}`}>{shieldStatus.toUpperCase()} MODE</div>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">{securityMetrics.contractsScanned}</div>
          <div className="text-sm text-white/60">Contracts Scanned</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{securityMetrics.vulnerabilitiesBlocked}</div>
          <div className="text-sm text-white/60">Threats Blocked</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gold">{securityMetrics.transactionsSecured.toLocaleString()}</div>
          <div className="text-sm text-white/60">Transactions Secured</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">{securityMetrics.complianceScore.toFixed(1)}%</div>
          <div className="text-sm text-white/60">Compliance Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{securityMetrics.gasOptimization.toFixed(1)}%</div>
          <div className="text-sm text-white/60">Gas Savings</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">
            {securityMetrics.multiSigActive ? "ACTIVE" : "INACTIVE"}
          </div>
          <div className="text-sm text-white/60">Multi-Sig Status</div>
        </div>
      </div>

      {/* Shield Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3">SCAN CONTRACTS</Button>
        <Button className="bg-gold hover:bg-gold/80 text-black font-bold py-3">DEPLOY SHIELD</Button>
      </div>
    </Card>
  )
}

export const BlockchainSecurityMonitor: React.FC = () => {
  const [securityLayers, setSecurityLayers] = useState([
    { name: "Identity Verification", status: "active", strength: 98.7, lastCheck: "2s ago" },
    { name: "Transaction Validation", status: "active", strength: 99.2, lastCheck: "1s ago" },
    { name: "Smart Contract Audit", status: "scanning", strength: 97.4, lastCheck: "5s ago" },
    { name: "Islamic Compliance Check", status: "active", strength: 100.0, lastCheck: "3s ago" },
    { name: "Multi-Signature Validation", status: "active", strength: 99.8, lastCheck: "1s ago" },
    { name: "Gas Optimization", status: "optimizing", strength: 89.3, lastCheck: "7s ago" },
  ])

  const getLayerStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/80 text-white"
      case "scanning":
        return "bg-blue-500/80 text-white"
      case "optimizing":
        return "bg-purple-500/80 text-white"
      case "warning":
        return "bg-yellow-500/80 text-black"
      case "error":
        return "bg-red-500/80 text-white"
      default:
        return "bg-gray-500/80 text-white"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">BLOCKCHAIN SECURITY LAYERS</h3>

      <div className="space-y-4">
        {securityLayers.map((layer, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex-1">
              <div className="font-semibold text-white">{layer.name}</div>
              <div className="text-sm text-white/60">
                Strength: {layer.strength}% • Last Check: {layer.lastCheck}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getLayerStatusColor(layer.status)}`}>
                {layer.status.toUpperCase()}
              </div>
              <div className="w-16 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-gold h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${layer.strength}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex space-x-4">
        <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold">FULL SCAN</Button>
        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 bg-transparent">
          CONFIGURE
        </Button>
      </div>
    </Card>
  )
}

export const ProofOfImpactValidator: React.FC = () => {
  const [validationQueue, setValidationQueue] = useState([
    { id: 1, action: "Teaching AI Ethics Course", impact: 847, status: "validating", bzs: 250 },
    { id: 2, action: "Community Garden Project", impact: 1247, status: "verified", bzs: 500 },
    { id: 3, action: "Open Source Contribution", impact: 634, status: "pending", bzs: 150 },
    { id: 4, action: "Mentoring Program", impact: 2156, status: "verified", bzs: 750 },
    { id: 5, action: "Environmental Cleanup", impact: 1834, status: "validating", bzs: 600 },
  ])

  const [totalBzsEarned, setTotalBzsEarned] = useState(0)

  useEffect(() => {
    const total = validationQueue.filter((item) => item.status === "verified").reduce((sum, item) => sum + item.bzs, 0)
    setTotalBzsEarned(total)
  }, [validationQueue])

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-400"
      case "validating":
        return "text-blue-400"
      case "pending":
        return "text-yellow-400"
      case "rejected":
        return "text-red-400"
      default:
        return "text-white"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">PROOF-OF-IMPACT VALIDATOR</h3>

      <div className="mb-6 text-center">
        <div className="text-4xl font-bold text-gold mb-2">{totalBzsEarned} BZS</div>
        <div className="text-sm text-white/60">Total Verified Earnings</div>
      </div>

      <div className="space-y-4 mb-6">
        {validationQueue.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold text-white">{item.action}</div>
              <div className="text-xs text-white/60">Impact Score: {item.impact}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gold">{item.bzs} BZS</div>
              <div className={`text-xs ${getValidationStatusColor(item.status)}`}>{item.status.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-gold hover:bg-gold/80 text-black font-bold">SUBMIT IMPACT</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold">VIEW HISTORY</Button>
      </div>
    </Card>
  )
}

export const IslamicComplianceChecker: React.FC = () => {
  const [complianceChecks, setComplianceChecks] = useState({
    ribaFree: true,
    ghararCompliant: true,
    halalActivities: true,
    shariahApproved: true,
    ethicalInvestment: true,
    transparentTerms: true,
  })

  const [overallCompliance, setOverallCompliance] = useState(100)

  useEffect(() => {
    const checks = Object.values(complianceChecks)
    const passedChecks = checks.filter(Boolean).length
    const compliance = (passedChecks / checks.length) * 100
    setOverallCompliance(compliance)
  }, [complianceChecks])

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">ISLAMIC FINANCE COMPLIANCE</h3>

      <div className="mb-6 text-center">
        <div className="text-4xl font-bold text-green-400 mb-2">{overallCompliance.toFixed(0)}%</div>
        <div className="text-sm text-white/60">Shariah Compliance Score</div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-white">Riba (Interest) Free</span>
          <div className={`w-6 h-6 rounded-full ${complianceChecks.ribaFree ? "bg-green-400" : "bg-red-400"}`}>
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              {complianceChecks.ribaFree ? "✓" : "✗"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-white">Gharar Compliant</span>
          <div className={`w-6 h-6 rounded-full ${complianceChecks.ghararCompliant ? "bg-green-400" : "bg-red-400"}`}>
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              {complianceChecks.ghararCompliant ? "✓" : "✗"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-white">Halal Activities Only</span>
          <div className={`w-6 h-6 rounded-full ${complianceChecks.halalActivities ? "bg-green-400" : "bg-red-400"}`}>
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              {complianceChecks.halalActivities ? "✓" : "✗"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-white">Shariah Board Approved</span>
          <div className={`w-6 h-6 rounded-full ${complianceChecks.shariahApproved ? "bg-green-400" : "bg-red-400"}`}>
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              {complianceChecks.shariahApproved ? "✓" : "✗"}
            </div>
          </div>
        </div>
      </div>

      <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">VERIFY COMPLIANCE</Button>
    </Card>
  )
}

export const MultiSignatureWallet: React.FC = () => {
  const [walletStatus, setWalletStatus] = useState({
    requiredSignatures: 3,
    totalSigners: 5,
    pendingTransactions: 2,
    completedTransactions: 847,
    walletBalance: 15847.32,
  })

  const [pendingTxs, setPendingTxs] = useState([
    { id: 1, amount: 500, recipient: "Community Fund", signatures: 2, required: 3 },
    { id: 2, amount: 1250, recipient: "Development Team", signatures: 1, required: 3 },
  ])

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">MULTI-SIGNATURE WALLET</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{walletStatus.walletBalance.toLocaleString()}</div>
          <div className="text-xs text-white/60">BZS Balance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {walletStatus.requiredSignatures}/{walletStatus.totalSigners}
          </div>
          <div className="text-xs text-white/60">Signature Req.</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{walletStatus.pendingTransactions}</div>
          <div className="text-xs text-white/60">Pending Txs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{walletStatus.completedTransactions}</div>
          <div className="text-xs text-white/60">Completed</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-white">Pending Transactions</h4>
        {pendingTxs.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <div className="font-semibold text-white">
                {tx.amount} BZS → {tx.recipient}
              </div>
              <div className="text-xs text-white/60">
                Signatures: {tx.signatures}/{tx.required}
              </div>
            </div>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
              SIGN
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-gold hover:bg-gold/80 text-black font-bold">NEW TRANSACTION</Button>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold">MANAGE SIGNERS</Button>
      </div>
    </Card>
  )
}
