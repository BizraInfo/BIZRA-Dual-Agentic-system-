"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const SecureDigitalVault: React.FC = () => {
  const [vaultStatus, setVaultStatus] = useState<"locked" | "unlocked" | "encrypting">("locked")
  const [encryptionLevel, setEncryptionLevel] = useState(256)
  const [securityMetrics, setSecurityMetrics] = useState({
    encryptionStrength: 99.97,
    accessAttempts: 0,
    lastAccess: new Date().toISOString(),
    dataIntegrity: 100,
    quantumResistance: 94.3,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityMetrics((prev) => ({
        ...prev,
        encryptionStrength: Math.min(99.99, prev.encryptionStrength + Math.random() * 0.01),
        quantumResistance: Math.max(90, prev.quantumResistance + (Math.random() - 0.5) * 0.1),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleVaultAccess = () => {
    setVaultStatus("encrypting")
    setTimeout(() => {
      setVaultStatus(vaultStatus === "locked" ? "unlocked" : "locked")
      setSecurityMetrics((prev) => ({
        ...prev,
        accessAttempts: prev.accessAttempts + 1,
        lastAccess: new Date().toISOString(),
      }))
    }, 2000)
  }

  return (
    <div className="relative">
      {/* Vault Core */}
      <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-8">
        <div className="text-center mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            {/* Vault Icon */}
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                vaultStatus === "locked"
                  ? "border-gold animate-pulse"
                  : vaultStatus === "unlocked"
                    ? "border-green-400 animate-spin"
                    : "border-blue-400 animate-bounce"
              }`}
            >
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gold/20 to-transparent backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`text-4xl transition-all duration-500 ${
                      vaultStatus === "locked"
                        ? "text-gold"
                        : vaultStatus === "unlocked"
                          ? "text-green-400"
                          : "text-blue-400"
                    }`}
                  >
                    {vaultStatus === "locked" ? "🔒" : vaultStatus === "unlocked" ? "🔓" : "⚡"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">SECURE DIGITAL VAULT</h3>
          <p className="text-gold/80 text-sm">Military-Grade Encryption Active</p>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{securityMetrics.encryptionStrength.toFixed(2)}%</div>
            <div className="text-xs text-white/60">Encryption Strength</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">AES-{encryptionLevel}</div>
            <div className="text-xs text-white/60">Cipher Standard</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{securityMetrics.quantumResistance.toFixed(1)}%</div>
            <div className="text-xs text-white/60">Quantum Resistance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold">{securityMetrics.dataIntegrity}%</div>
            <div className="text-xs text-white/60">Data Integrity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{securityMetrics.accessAttempts}</div>
            <div className="text-xs text-white/60">Access Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">ZERO</div>
            <div className="text-xs text-white/60">Breaches</div>
          </div>
        </div>

        {/* Vault Controls */}
        <div className="space-y-4">
          <Button
            onClick={handleVaultAccess}
            disabled={vaultStatus === "encrypting"}
            className="w-full bg-gold hover:bg-gold/80 text-black font-bold py-3"
          >
            {vaultStatus === "encrypting" ? "PROCESSING..." : vaultStatus === "locked" ? "UNLOCK VAULT" : "LOCK VAULT"}
          </Button>

          <div className="text-xs text-white/40 text-center">
            Last Access: {new Date(securityMetrics.lastAccess).toLocaleTimeString()}
          </div>
        </div>
      </Card>

      {/* Security Layers Visualization */}
      <div className="absolute -inset-4 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute inset-0 rounded-lg border transition-all duration-2000 ${
              vaultStatus === "unlocked" ? "border-green-400/20 animate-pulse" : "border-gold/10"
            }`}
            style={{
              transform: `scale(${1 + i * 0.1})`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export const VaultManagementDashboard: React.FC = () => {
  const [vaults, setVaults] = useState([
    { id: 1, name: "Personal Data Vault", status: "active", encryption: "AES-256", size: "2.4 GB" },
    { id: 2, name: "AI Training Vault", status: "active", encryption: "AES-512", size: "847 MB" },
    { id: 3, name: "Economic Data Vault", status: "standby", encryption: "AES-256", size: "1.2 GB" },
    { id: 4, name: "Consciousness Vault", status: "active", encryption: "Quantum-Safe", size: "3.8 GB" },
  ])

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">VAULT MANAGEMENT SYSTEM</h3>

      <div className="space-y-4">
        {vaults.map((vault) => (
          <div
            key={vault.id}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div>
              <div className="font-semibold text-white">{vault.name}</div>
              <div className="text-sm text-white/60">
                {vault.encryption} • {vault.size}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  vault.status === "active"
                    ? "bg-green-500/80 text-white"
                    : vault.status === "standby"
                      ? "bg-yellow-500/80 text-white"
                      : "bg-red-500/80 text-white"
                }`}
              >
                {vault.status.toUpperCase()}
              </div>
              <Button size="sm" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 bg-transparent">
                ACCESS
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export const EncryptionKeyManager: React.FC = () => {
  const [keyRotationStatus, setKeyRotationStatus] = useState("stable")
  const [nextRotation, setNextRotation] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000))

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">ENCRYPTION KEY MANAGEMENT</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gold mb-3">Active Keys</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Master Key:</span>
              <span className="text-green-400 font-mono">RSA-4096</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Session Key:</span>
              <span className="text-blue-400 font-mono">AES-256-GCM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Backup Key:</span>
              <span className="text-purple-400 font-mono">ChaCha20-Poly1305</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gold mb-3">Key Rotation</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Status:</span>
              <span className="text-green-400">{keyRotationStatus.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Next Rotation:</span>
              <span className="text-white">{nextRotation.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Auto-Rotate:</span>
              <span className="text-green-400">ENABLED</span>
            </div>
          </div>
        </div>
      </div>

      <Button className="w-full mt-6 bg-gold hover:bg-gold/80 text-black font-bold">ROTATE KEYS NOW</Button>
    </Card>
  )
}
