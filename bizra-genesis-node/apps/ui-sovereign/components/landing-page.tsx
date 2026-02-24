"use client"

import { useState } from "react"
import { GenesisStory } from "@/components/sovereign/genesis-story"
import { BizraHero } from "@/components/hero/bizra-hero"
import { GenesisSection } from "@/components/sections/genesis-section"
import { ProtocolSection } from "@/components/sections/protocol-section"
import { ReasoningConsole } from "@/components/sovereign/reasoning-console"
import { FooterSection } from "@/components/sections/footer-section"

export function LandingPage() {
    // Check session storage to verify if user has seen the intro
    // For unique UX demo, we default to showing it
    const [showIntro, setShowIntro] = useState(true)

    if (showIntro) {
        return <GenesisStory onEnter={() => setShowIntro(false)} />
    }

    return (
        <main className="animate-in fade-in duration-1000">
            <BizraHero />
            <GenesisSection />
            <ProtocolSection />
            
            {/* The Sovereign Engine Section */}
            <section className="py-24 bg-[#020617] border-y border-[#C9A962]/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#C9A962] mb-4">
                            Sovereign Intelligence Engine
                        </h2>
                        <p className="text-[#C9A962]/50 max-w-2xl mx-auto text-sm md:text-base">
                            Experience the Graph-of-Thought (GoT) Synthesis. 
                            Anchored in Wisdom Roots. Pruned for SNR. 
                            Verified for Ihsan.
                        </p>
                    </div>
                    <ReasoningConsole />
                </div>
            </section>

            <FooterSection />
        </main>
    )
}
