"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Key, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { wsManager } from "@/lib/websocket-manager"

interface AuthFlowProps {
  onAuthenticated: (session: any) => void
}

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [step, setStep] = useState<"upload" | "validate" | "success">("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [keyContent, setKeyContent] = useState<string>("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setKeyContent(content)
      setStep("validate")
    }
    reader.readAsText(file)
  }

  const handleAuthenticate = async () => {
    setIsLoading(true)
    try {
      // Simulate auth delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // In production, this would send the signature to the backend
      // const session = await wsManager.send("auth.authenticate", { key: keyContent })
      
      // Mock success for UI demo
      const mockSession = { token: "bizra_session_" + Date.now(), user: "Genesis Node" }
      
      setStep("success")
      setTimeout(() => {
        onAuthenticated(mockSession)
      }, 1000)
      
      toast.success("Identity Verified Successfully")
    } catch (error) {
      toast.error("Authentication Failed")
      setStep("upload")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className="bg-navy-900/50 border-gold-500/30 backdrop-blur-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto border border-gold-500/30">
                <Key className="w-8 h-8 text-gold-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-serif text-gold-100 mb-2">Identity Verification</h2>
                <p className="text-navy-200 text-sm">Upload your Ed25519 identity key to access the Genesis Node.</p>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pem,.key"
                />
                <div className="border-2 border-dashed border-gold-500/30 rounded-lg p-8 transition-colors group-hover:border-gold-500/60 group-hover:bg-gold-500/5">
                  <Upload className="w-8 h-8 text-gold-400 mx-auto mb-3" />
                  <p className="text-sm text-gold-200">Drop your key file here or click to browse</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "validate" && (
            <motion.div
              key="validate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto border border-gold-500/30 mb-4">
                  <ShieldCheck className="w-8 h-8 text-gold-400" />
                </div>
                <h2 className="text-xl font-serif text-gold-100">Validate Identity</h2>
                <p className="text-navy-200 text-sm mt-2">Key loaded. Ready to sign challenge.</p>
              </div>

              <div className="bg-black/30 rounded p-4 font-mono text-xs text-gold-300/70 break-all border border-gold-500/10">
                {keyContent.slice(0, 64)}...
              </div>

              <Button 
                onClick={handleAuthenticate} 
                disabled={isLoading}
                className="w-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Cryptography...
                  </>
                ) : (
                  <>
                    Authenticate Session
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/50">
                <ShieldCheck className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-serif text-white">Access Granted</h2>
              <p className="text-navy-200">Initializing secure connection...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
