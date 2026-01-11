"use client"

import { ReasoningResult } from "@/lib/api-client"
import { FileText, Code, Database, BookOpen, Share2, Maximize2, X } from "lucide-react"

interface SovereignCanvasProps {
  result: ReasoningResult | null
  isVisible: boolean
  onClose: () => void
}

export function SovereignCanvas({ result, isVisible, onClose }: SovereignCanvasProps) {
  if (!isVisible || !result) return null

  const artifacts = result.metadata?.artifacts || []

  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-[#020617] border-l border-[#C9A962]/30 shadow-2xl z-50 animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col">
      {/* Canvas Header */}
      <div className="bg-[#0f172a] border-b border-[#C9A962]/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#C9A962]" />
          <span className="text-sm font-bold tracking-wider text-[#C9A962]/80 uppercase">
            Sovereign Canvas (Apotheosis Artifacts)
          </span>
        </div>
        <button onClick={onClose} className="text-[#C9A962]/50 hover:text-[#C9A962] transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Artifact Grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {artifacts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#C9A962]/30 text-center">
            <Share2 className="w-12 h-12 mb-4 animate-pulse" />
            <p className="text-sm italic">Gathering artifacts from the Apotheosis loop...</p>
          </div>
        )}

        {artifacts.map((artifact) => (
          <div key={artifact.id} className="bg-black/40 border border-[#C9A962]/20 rounded-lg overflow-hidden group hover:border-[#C9A962]/50 transition-all">
            <div className="bg-[#0f172a]/50 px-4 py-2 border-b border-[#C9A962]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {artifact.content_type === "CodeSnippet" ? (
                  <Code className="w-4 h-4 text-[#C9A962]/60" />
                ) : artifact.content_type === "ResearchPaper" ? (
                  <BookOpen className="w-4 h-4 text-[#C9A962]/60" />
                ) : (
                  <FileText className="w-4 h-4 text-[#C9A962]/60" />
                )}
                <span className="text-[10px] uppercase tracking-widest text-[#C9A962]/60">
                  {artifact.title}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3 h-3 text-[#C9A962]/40 hover:text-[#C9A962]" />
              </button>
            </div>
            
            <div className="p-4">
              {artifact.content_type === "CodeSnippet" ? (
                <pre className="text-[11px] text-[#F9F1D8]/90 font-mono bg-black/50 p-3 rounded border border-[#C9A962]/5 overflow-x-auto">
                    <code>{artifact.body}</code>
                </pre>
              ) : (
                <div className="text-xs leading-relaxed text-[#F9F1D8]/80 whitespace-pre-wrap font-sans">
                  {artifact.body}
                </div>
              )}
            </div>

            {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
              <div className="px-4 py-2 border-t border-[#C9A962]/5 flex gap-4">
                {Object.entries(artifact.metadata).map(([key, val]) => (
                  <div key={key} className="text-[9px] text-[#C9A962]/40">
                    <span className="uppercase">{key}:</span> <span className="text-[#C9A962]/60">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Self-Summarization View */}
        {result.metadata?.summary && (
          <div className="mt-12 p-6 border border-[#C9A962]/10 bg-[#0f172a]/20 rounded-xl">
             <div className="flex items-center gap-2 mb-4">
               <Database className="w-5 h-5 text-[#C9A962]" />
               <h3 className="text-sm font-bold text-[#C9A962] uppercase tracking-tighter">Sovereign State (O1 Context)</h3>
             </div>
             <div className="space-y-3">
               <div className="text-[10px] text-[#C9A962]/40 uppercase tracking-widest">Accumulated Knowledge</div>
               <div className="text-xs text-[#F9F1D8]/70 italic border-l-2 border-[#C9A962]/20 pl-3">
                 {result.metadata.summary.accumulated_knowledge}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
