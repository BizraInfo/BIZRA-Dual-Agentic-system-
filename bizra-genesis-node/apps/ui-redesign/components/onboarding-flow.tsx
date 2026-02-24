"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Check, Cpu, HardDrive, MemoryStick, Monitor, Shield, Zap, Activity, Download, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  onComplete: () => void
}

// System specifications based on JSON data
const systemRequirements = {
  minRAM: 12,
  minStorage: 50,
  recommendedRAM: 32,
  recommendedStorage: 100
}

// Personal Agents from JSON
const personalAgents = [
  { name: "Strategic Planner", role: "High-level planning and goal decomposition", icon: "🎯", color: "#FFD700" },
  { name: "Research Assistant", role: "Information gathering and analysis", icon: "🔍", color: "#4169E1" },
  { name: "Creative Designer", role: "Visual and creative problem solving", icon: "🎨", color: "#FF6347" },
  { name: "Data Analyst", role: "Quantitative analysis and insights", icon: "📊", color: "#32CD32" },
  { name: "Security Guardian", role: "Privacy and security enforcement", icon: "🛡️", color: "#8A2BE2" },
  { name: "Learning Optimizer", role: "Continuous improvement and adaptation", icon: "📈", color: "#FF1493" },
  { name: "Task Coordinator", role: "Multi-agent orchestration", icon: "🔄", color: "#00CED1" }
]

// Installation Phases from JSON
const installationPhases = [
  { phase: "Environment Scan", description: "Analyzing your system capabilities", duration: "30 seconds" },
  { phase: "Profile Setup", description: "Creating your personal AI configuration", duration: "60 seconds" },
  { phase: "Component Download", description: "Retrieving BIZRA Sovereign OS components", duration: "5-10 minutes" },
  { phase: "Agent Deployment", description: "Initializing your 7 personal AI agents", duration: "2-3 minutes" },
  { phase: "System Integration", description: "Connecting to desktop environment", duration: "1-2 minutes" },
  { phase: "Validation & Testing", description: "Verifying installation success", duration: "1 minute" }
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState({ status: 'Initializing...', detail: 'Preparing scan...' })
  const [systemSpecs, setSystemSpecs] = useState<any>(null)
  const [profile, setProfile] = useState({ name: '', privacy: 'maximum' })
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)

  // Step 1: System Scan Logic
  const startScan = () => {
    const scanSteps = [
      { status: 'Detecting Hardware...', detail: 'Analyzing CPU, GPU, RAM, and Storage' },
      { status: 'Checking System Profile...', detail: 'Looking for existing BIZRA configurations' },
      { status: 'Analyzing Capabilities...', detail: 'Determining optimal settings' },
      { status: 'Scan Complete!', detail: 'System analysis finished successfully' }
    ]
    
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < scanSteps.length) {
        setScanStatus(scanSteps[currentStep])
        setScanProgress((prev) => Math.min(prev + 25, 100))
        currentStep++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setSystemSpecs({
            gpu: { model: 'NVIDIA RTX 4090', vram: '24 GB' },
            cpu: { model: 'Intel Core i9-14900K', cores: 24 },
            ram: { total: 64, available: 58 },
            storage: { type: 'NVMe SSD', available: 847 }
          })
          setStep(2)
        }, 500)
      }
    }, 1200)
  }

  // Step 4: Generation Logic
  useEffect(() => {
    if (step === 4) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          const next = prev + (Math.random() * 2)
          if (next >= 100) {
            clearInterval(interval)
            setTimeout(() => setStep(5), 500)
            return 100
          }
          
          // Update phase based on progress
          const phaseIndex = Math.floor((next / 100) * installationPhases.length)
          if (phaseIndex !== currentPhase && phaseIndex < installationPhases.length) {
            setCurrentPhase(phaseIndex)
          }
          
          return next
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [step, currentPhase])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1026] text-[#F8F6F1]">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A962]/10 border border-[#C9A962]/30 flex items-center justify-center text-2xl font-serif text-[#C9A962]">
            {step < 5 ? step : '✓'}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#C9A962] mb-2">
            {step === 1 && "System Initialization"}
            {step === 2 && "Analysis Complete"}
            {step === 3 && "Create Profile"}
            {step === 4 && "Generating Installer"}
            {step === 5 && "Ready to Deploy"}
          </h2>
          <p className="text-[#8892b0]">
            {step === 1 && "Scanning environment for optimal BIZRA configuration"}
            {step === 2 && "Your hardware is ready for Sovereign OS"}
            {step === 3 && "Customize your personal AI experience"}
            {step === 4 && "Packaging your custom sovereign environment"}
            {step === 5 && "Your unified installer is ready for download"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Scan */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-64 h-64 mb-12">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-[#C9A962]/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C9A962] mb-2">{scanProgress}%</div>
                    <div className="text-sm text-[#8892b0]">{scanStatus.status}</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={startScan} 
                disabled={scanProgress > 0}
                className="bg-[#C9A962] text-[#0B1026] hover:bg-[#D4B472] min-w-[200px]"
              >
                {scanProgress > 0 ? 'Scanning...' : 'Start System Scan'}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && systemSpecs && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <SpecCard icon={<Monitor />} label="GPU" value={systemSpecs.gpu.model} sub={systemSpecs.gpu.vram} />
                <SpecCard icon={<Cpu />} label="CPU" value={systemSpecs.cpu.model} sub={`${systemSpecs.cpu.cores} Cores`} />
                <SpecCard icon={<MemoryStick />} label="RAM" value={`${systemSpecs.ram.total} GB`} sub="Available" />
                <SpecCard icon={<HardDrive />} label="Storage" value={systemSpecs.storage.type} sub={`${systemSpecs.storage.available} GB Free`} />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="border-[#C9A962]/30 text-[#C9A962]">
                  Rescan
                </Button>
                <Button onClick={() => setStep(3)} className="bg-[#C9A962] text-[#0B1026] hover:bg-[#D4B472]">
                  Continue Setup <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Profile */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Card className="p-6 bg-[#11162D] border-[#C9A962]/20">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Your Name</label>
                    <Input 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="bg-[#0B1026] border-[#C9A962]/20 text-[#F8F6F1]"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Privacy Level</label>
                    <Select value={profile.privacy} onValueChange={(v) => setProfile({...profile, privacy: v})}>
                      <SelectTrigger className="bg-[#0B1026] border-[#C9A962]/20 text-[#F8F6F1]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#11162D] border-[#C9A962]/20 text-[#F8F6F1]">
                        <SelectItem value="maximum">Maximum (Local Only)</SelectItem>
                        <SelectItem value="balanced">Balanced (Hybrid)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <div>
                <h3 className="text-xl font-serif text-[#C9A962] mb-4">Your Agent Team</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {personalAgents.slice(0, 4).map((agent, i) => (
                    <div key={i} className="p-4 rounded-lg bg-[#11162D] border border-[#C9A962]/10 text-center">
                      <div className="text-2xl mb-2">{agent.icon}</div>
                      <div className="text-sm font-medium text-[#F8F6F1]">{agent.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="border-[#C9A962]/30 text-[#C9A962]">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!profile.name}
                  className="bg-[#C9A962] text-[#0B1026] hover:bg-[#D4B472]"
                >
                  Generate Installer <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Generation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="relative h-4 bg-[#11162D] rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C9A962] to-[#4ECDC4]"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              <div className="space-y-4">
                {installationPhases.map((phase, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-colors",
                    i === currentPhase ? "bg-[#C9A962]/10 border border-[#C9A962]/30" : "opacity-50"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      i < currentPhase ? "bg-[#4ECDC4] text-[#0B1026]" : 
                      i === currentPhase ? "bg-[#C9A962] text-[#0B1026] animate-pulse" : 
                      "bg-[#11162D] text-[#8892b0]"
                    )}>
                      {i < currentPhase ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-[#F8F6F1]">{phase.phase}</div>
                      <div className="text-xs text-[#8892b0]">{phase.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 mx-auto bg-[#4ECDC4]/20 rounded-full flex items-center justify-center text-[#4ECDC4]">
                <Check className="w-12 h-12" />
              </div>

              <div className="bg-[#11162D] border border-[#C9A962]/30 rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-serif text-[#F8F6F1] mb-6">Installer Package Ready</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#C9A962]/10">
                    <span className="text-[#8892b0]">Filename</span>
                    <span className="font-mono text-[#C9A962]">BIZRA-OS-{profile.name.replace(/\s+/g, '-')}.exe</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#C9A962]/10">
                    <span className="text-[#8892b0]">Size</span>
                    <span className="text-[#F8F6F1]">4.2 GB</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#C9A962]/10">
                    <span className="text-[#8892b0]">Components</span>
                    <span className="text-[#F8F6F1]">AgentFlow 8B + 7 Agents</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onComplete}
                className="bg-[#C9A962] text-[#0B1026] hover:bg-[#D4B472] w-full max-w-md h-12 text-lg"
              >
                <Download className="mr-2 w-5 h-5" /> Download & Install
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SpecCard({ icon, label, value, sub }: any) {
  return (
    <div className="p-4 bg-[#11162D] border border-[#C9A962]/10 rounded-lg flex items-center gap-4">
      <div className="w-10 h-10 rounded bg-[#C9A962]/10 flex items-center justify-center text-[#C9A962]">
        {icon}
      </div>
      <div>
        <div className="text-xs text-[#8892b0]">{label}</div>
        <div className="font-medium text-[#F8F6F1]">{value}</div>
        <div className="text-xs text-[#C9A962]">{sub}</div>
      </div>
    </div>
  )
}
