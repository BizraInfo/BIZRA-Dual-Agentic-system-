"use client"

import { useState, useRef, useEffect } from "react"
import { submitReasoning, ReasoningResult } from "@/lib/api-client"
import { Terminal, Cpu, Share2, Zap, Brain, ShieldCheck, ChevronRight, LayoutPanelRight, AlertTriangle } from "lucide-react"
import { SovereignCanvas } from "./sovereign-canvas"

export function ReasoningConsole() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ReasoningResult | null>(null)
  const [activeStep, setActiveStep] = useState(-1)
  const [showCanvas, setShowCanvas] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleReason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt || isLoading) return

    setIsLoading(true)
    setResult(null)
    setActiveStep(-1)

    try {
      const data = await submitReasoning({ prompt })
      setResult(data)
      // Animate steps
      for (let i = 0; i < data.steps.length; i++) {
        setActiveStep(i)
        await new Promise(r => setTimeout(r, 800))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeStep])

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#020617] border border-[#C9A962]/30 rounded-lg overflow-hidden shadow-2xl shadow-[#C9A962]/10 font-mono">
      {/* Console Header */}
      <div className="bg-[#0f172a] border-b border-[#C9A962]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#C9A962]" />
          <span className="text-sm font-bold tracking-wider text-[#C9A962]/80 uppercase">
            Sovereign Reasoner v7.0 (SGoT Mode)
          </span>
        </div>
        <div className="flex gap-2">
          {result && (
            <button 
              onClick={() => setShowCanvas(true)}
              className="flex items-center gap-2 text-xs bg-[#C9A962]/10 hover:bg-[#C9A962]/20 border border-[#C9A962]/30 px-3 py-1 rounded transition-all text-[#C9A962]"
            >
              <LayoutPanelRight className="w-3 h-3" />
              VIEW CANVAS
            </button>
          )}
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
      </div>

      <div className="p-6">
        {/* Input Form */}
        <form onSubmit={handleReason} className="mb-8">
          <label className="block text-[10px] text-[#C9A962]/50 uppercase mb-2 tracking-[0.2em]">
            Input Sovereign Prompt
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="System: Interdisciplinary analysis of..."
              className="flex-1 bg-black/40 border border-[#C9A962]/20 rounded px-4 py-2 text-sm text-[#F9F1D8] focus:outline-none focus:border-[#C9A962]/50 transition-colors"
            />
            <button
              disabled={isLoading}
              className="bg-[#C9A962] hover:bg-[#A98942] text-black px-6 py-2 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <span className="flex items-center gap-2">
                  RUN <Zap className="w-3 h-3 fill-current" />
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Execution Logs */}
        <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto mb-6 pr-4 custom-scrollbar" ref={scrollRef}>
          {isLoading && activeStep === -1 && (
              <div className="flex items-center gap-3 text-[#C9A962]/60 animate-pulse">
                <Cpu className="w-4 h-4" />
                <span className="text-xs">Initialising House of Wisdom anchors...</span>
              </div>
          )}

          {result?.steps.slice(0, activeStep + 1).map((step, i) => (
            <div key={i} className="flex gap-3 text-xs animate-in slide-in-from-left duration-300">
               <div className="mt-0.5">
                    {step.includes("⚠️") || step.includes("⛔") ? (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : step.includes("🏆") ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-[#C9A962]/40" />
                    )}
               </div>
               <div className={`leading-relaxed ${step.includes("🏆") ? "text-emerald-400 font-bold" : "text-[#C9A962]/80"}`}>
                 {step}
               </div>
            </div>
          ))}

          {activeStep === (result?.steps.length ?? -1) - 1 && result && (
              <div className="mt-8 pt-6 border-t border-[#C9A962]/10">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-[0.2em]">Sovereign Synthesis (Winning Signal)</span>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-6 text-sm text-[#F9F1D8] leading-relaxed shadow-inner italic">
                  "{result.conclusion}"
                </div>
                <div className="mt-4 flex justify-between items-center text-[9px] text-[#C9A962]/40">
                    <div className="flex gap-4">
                        <span>CONFIDENCE: {(result.confidence * 100).toFixed(2)}%</span>
                        <span>ALGORITHM: SGoT v7.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500/60 font-bold">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED MASTERPIECE
                    </div>
                </div>
              </div>
          )}
        </div>
      </div>

      <SovereignCanvas 
        result={result} 
        isVisible={showCanvas} 
        onClose={() => setShowCanvas(false)} 
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 98, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 169, 98, 0.4);
        }
      `}</style>
    </div>
  )
}
