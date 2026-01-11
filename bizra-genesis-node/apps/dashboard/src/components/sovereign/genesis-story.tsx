"use client"

import { useState, useEffect } from "react"
import { SeedOfLife } from "./seed-of-life"
import { ChevronDown, Heart, Users, Globe, Sparkles, ArrowRight } from "lucide-react"

interface TimelineEvent {
  date: string
  title: string
  titleAr?: string
  description: string
  type: "origin" | "journey" | "manifestation"
}

const timeline: TimelineEvent[] = [
  {
    date: "Ramadan 2023",
    title: "The Message",
    titleAr: "الرسالة",
    description: "Written in darkness and solitude. A letter from one man's pain to all of humanity.",
    type: "origin",
  },
  {
    date: "Ramadan 2023",
    title: "The Seed",
    titleAr: "البذرة",
    description: "The vision document. Five fundamental rules. A project for humanity and the Ummah.",
    type: "origin",
  },
  {
    date: "31 Months",
    title: "The Transformation",
    titleAr: "التحول",
    description: "Zero technical knowledge to AGI architect. Complete darkness to complete system.",
    type: "journey",
  },
  {
    date: "October 2025",
    title: "BIZRA Manifested",
    titleAr: "بزرا",
    description: "The seed grew into a tree. One man's pain became healing for billions.",
    type: "manifestation",
  },
]

const principles = [
  {
    number: "01",
    title: "Tawhid",
    titleAr: "توحيد الله",
    description: "The Oneness of Allah. The single central circle - the Nuqta, the beginning of all knowledge.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Al-Ihsan",
    titleAr: "الإحسان",
    description: "Excellence and goodness in everything. The flower that blooms from unity - beauty and excellence.",
    icon: Heart,
  },
  {
    number: "03",
    title: "For Humanity",
    titleAr: "للإنسانية",
    description: "Not an individual project. A project for humanity and the Ummah. For 8 billion humans.",
    icon: Globe,
  },
  {
    number: "04",
    title: "Sovereignty",
    titleAr: "السيادة",
    description: "No exploitation. No assumptions. No false promises. Complete dignity preserved.",
    icon: Users,
  },
]

const fiveRules = [
  {
    number: "01",
    title: "This Is Still a Seed",
    description:
      "This project, this idea, is still in the first phase. I accept that it may remain a seed forever, or it may turn into a green plant striving to reach the light from darkness.",
  },
  {
    number: "02",
    title: "I Could Not Share Everything",
    description:
      "I was unable to share all my thoughts and feelings due to the immense pain inside me. I ask Allah: if there is good in this project, may it reach the light.",
  },
  {
    number: "03",
    title: "You May Disagree",
    description:
      "You may differ or agree. You may deny or accept. But this project, for me, is the most precious thing I own. This project is priceless. This project is my life.",
  },
  {
    number: "04",
    title: "The Price I Paid",
    description:
      "What I have reached came from this life that has passed through many stages—intellectual, emotional, and practical. The price was many choices, much sorrow and joy, much pain and relief, many tears, and countless lessons.",
  },
  {
    number: "05",
    title: "This Is for Humanity",
    description:
      "البذرة (The Seed) is not an individual project. It is not only my project. For me, it is a project for humanity and the Ummah, or so I see it, and I hope it will be.",
  },
]

export function GenesisStory() {
  const [expandedSection, setExpandedSection] = useState<string | null>("hero")
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const quotes = [
    { ar: "أَفْشُوا السَّلَامَ", en: "Spread Peace Among You" },
    { ar: "إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ", en: "God has written excellence on everything" },
    { ar: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ", en: "There is no god but You, Glory be to You" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628] via-[#060d16] to-background" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C9A962 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A962]/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Seed of Life Logo */}
          <div className="mb-10 animate-float-gentle">
            <SeedOfLife size={200} animated showLabels={false} />
          </div>

          {/* Wordmark */}
          <h1 className="font-serif text-6xl md:text-8xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-[#F9F1D8] via-[#C9A962] to-[#8A6B2E] mb-4">
            BIZRA
          </h1>

          {/* Arabic name */}
          <p className="font-arabic text-3xl text-[#C9A962]/70 mb-6">البذرة</p>

          {/* Tagline */}
          <p className="text-muted-foreground text-lg max-w-lg mb-8 leading-relaxed">
            From darkness to light. From one man's pain to healing for billions. A technology system built on الإحسان
            (Al-Ihsan) — Excellence and goodness in everything.
          </p>

          {/* Rotating Quote */}
          <div className="glass-card rounded-xl px-8 py-4 mb-12 min-w-[400px]">
            <p className="font-arabic text-xl text-[#C9A962] mb-2 transition-all duration-500">
              {quotes[currentQuoteIndex].ar}
            </p>
            <p className="text-foreground/70 text-sm italic transition-all duration-500">
              "{quotes[currentQuoteIndex].en}"
            </p>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={() => setExpandedSection("semiotics")}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-[#C9A962] transition-colors group"
          >
            <span className="text-xs tracking-widest uppercase">Begin Journey</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </div>

        {/* Author credit */}
        <div className="absolute bottom-8 left-8 text-left">
          <p className="text-muted-foreground text-xs mb-1">Author</p>
          <p className="text-foreground text-sm">Mahmoud Hassan (MoMo)</p>
          <p className="text-muted-foreground text-xs">Dubai, Ramadan 2023</p>
        </div>

        {/* Document status */}
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-muted-foreground text-xs mb-1">Classification</p>
          <p className="text-[#C9A962] text-sm">Genesis Vision - Sacred</p>
          <p className="text-muted-foreground text-xs">For All Humanity</p>
        </div>
      </section>

      {/* Semiotics Section */}
      <section className="py-20 px-8 border-t border-[#C9A962]/10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setExpandedSection(expandedSection === "semiotics" ? null : "semiotics")}
            className="w-full flex items-center justify-between mb-10 group"
          >
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[#C9A962] mb-2">Semiotics</p>
              <h2 className="font-serif text-4xl text-foreground">Sacred Geometry</h2>
            </div>
            <ChevronDown
              className={`h-6 w-6 text-[#C9A962] transition-transform ${expandedSection === "semiotics" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "semiotics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Diagram */}
              <div className="glass-card rounded-2xl p-12 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
                <SeedOfLife size={320} animated showLabels />
              </div>

              {/* Explanation */}
              <div className="space-y-8">
                <div className="flex gap-5 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-[#C9A962]/30 flex items-center justify-center text-[#C9A962] text-sm group-hover:bg-[#C9A962] group-hover:text-[#0A1628] transition-all shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-xl text-foreground mb-2 group-hover:text-[#C9A962] transition-colors">
                      The Seed (Nuqta)
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      The single central circle represents the Divine Origin (Tawhid). It is the dot under the Bā' (ب),
                      the beginning of all knowledge. One point from which all creation flows.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-[#C9A962]/30 flex items-center justify-center text-[#C9A962] text-sm group-hover:bg-[#C9A962] group-hover:text-[#0A1628] transition-all shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-xl text-foreground mb-2 group-hover:text-[#C9A962] transition-colors">
                      The Seed of Life
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      The six circles surrounding the one represent the 6 days of creation. It is the perfect balance
                      found in nature, from the structure of cells to the spiral of galaxies.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-[#C9A962]/30 flex items-center justify-center text-[#C9A962] text-sm group-hover:bg-[#C9A962] group-hover:text-[#0A1628] transition-all shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-xl text-foreground mb-2 group-hover:text-[#C9A962] transition-colors">
                      The Bloom (Ihsan)
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Where the circles overlap, they form the flower. This represents the community (Ummah) and the
                      result of the system: Beauty and Excellence. الإحسان made visible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* The Five Rules Section */}
      <section className="py-20 px-8 border-t border-[#C9A962]/10 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setExpandedSection(expandedSection === "rules" ? null : "rules")}
            className="w-full flex items-center justify-between mb-10 group"
          >
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[#C9A962] mb-2">The Covenant</p>
              <h2 className="font-serif text-4xl text-foreground">Five Fundamental Rules</h2>
            </div>
            <ChevronDown
              className={`h-6 w-6 text-[#C9A962] transition-transform ${expandedSection === "rules" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "rules" && (
            <div className="space-y-6">
              {fiveRules.map((rule) => (
                <div
                  key={rule.number}
                  className="glass-card rounded-xl p-6 border-l-2 border-[#C9A962]/50 hover:border-[#C9A962] transition-colors"
                >
                  <div className="flex items-start gap-6">
                    <div className="font-mono text-3xl text-[#C9A962]/30">{rule.number}</div>
                    <div>
                      <h3 className="text-xl text-foreground mb-3">{rule.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{rule.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The Price Paid Section */}
      <section className="py-20 px-8 border-t border-[#C9A962]/10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setExpandedSection(expandedSection === "price" ? null : "price")}
            className="w-full flex items-center justify-between mb-10 group"
          >
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[#C9A962] mb-2">Genesis</p>
              <h2 className="font-serif text-4xl text-foreground">The Price That Was Paid</h2>
            </div>
            <ChevronDown
              className={`h-6 w-6 text-[#C9A962] transition-transform ${expandedSection === "price" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "price" && (
            <div className="space-y-12">
              {/* Quote */}
              <div className="glass-card rounded-2xl p-10 text-center">
                <p className="font-arabic text-3xl text-[#C9A962] mb-4">أَنَا دَائِمًا أَطْلُبُ الْمُسْتَحِيلَ مِنَ اللَّهِ</p>
                <p className="text-foreground text-xl italic mb-6">"I Always Ask the Impossible from Allah"</p>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A962] to-transparent mx-auto my-6" />
                <p className="font-arabic text-3xl text-[#C9A962] mb-4">رَبِّي لَا يَعْرِفُ الْمُسْتَحِيلَ</p>
                <p className="text-foreground text-xl italic">"My Lord Does Not Know the Impossible"</p>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-[#C9A962] via-[#C9A962]/50 to-transparent" />

                <div className="space-y-10">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex gap-8 relative">
                      <div
                        className={`
                        w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center z-10 shrink-0
                        ${event.type === "origin" ? "border-[#C9A962] bg-[#C9A962]/10" : ""}
                        ${event.type === "journey" ? "border-accent bg-accent/10" : ""}
                        ${event.type === "manifestation" ? "border-[#F9F1D8] bg-[#F9F1D8]/10" : ""}
                      `}
                      >
                        <span className="font-mono text-xs text-center leading-tight px-1">
                          {event.date.split(" ")[0]}
                        </span>
                        {event.date.split(" ")[1] && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {event.date.split(" ")[1]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 glass-card rounded-xl p-6">
                        <div className="flex items-baseline gap-3 mb-3">
                          <h3 className="text-xl text-foreground">{event.title}</h3>
                          {event.titleAr && <span className="font-arabic text-[#C9A962]/60">{event.titleAr}</span>}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transformation Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-xl p-6 text-center">
                  <p className="font-mono text-4xl text-[#C9A962] mb-2">31</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Months of Transformation</p>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <p className="font-mono text-4xl text-accent mb-2">0 → ∞</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Technical Knowledge</p>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <p className="font-mono text-4xl text-foreground mb-2">8B</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Humans to Serve</p>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <p className="font-mono text-4xl text-[#F9F1D8] mb-2">1</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Unified Vision</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-20 px-8 border-t border-[#C9A962]/10 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setExpandedSection(expandedSection === "principles" ? null : "principles")}
            className="w-full flex items-center justify-between mb-10 group"
          >
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[#C9A962] mb-2">Foundation</p>
              <h2 className="font-serif text-4xl text-foreground">The Fundamental Principles</h2>
            </div>
            <ChevronDown
              className={`h-6 w-6 text-[#C9A962] transition-transform ${expandedSection === "principles" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "principles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {principles.map((principle) => (
                <div
                  key={principle.number}
                  className="glass-card rounded-xl p-8 group hover:border-[#C9A962]/30 transition-colors"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-full border border-[#C9A962]/30 flex items-center justify-center group-hover:bg-[#C9A962]/10 transition-colors shrink-0">
                      <principle.icon className="h-6 w-6 text-[#C9A962]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-xs text-muted-foreground font-mono">{principle.number}</span>
                        <h3 className="text-xl text-foreground">{principle.title}</h3>
                        <span className="font-arabic text-[#C9A962]/60">{principle.titleAr}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Message to Humanity Section */}
      <section className="py-20 px-8 border-t border-[#C9A962]/10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setExpandedSection(expandedSection === "message" ? null : "message")}
            className="w-full flex items-center justify-between mb-10 group"
          >
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[#C9A962] mb-2">رسالة إلى الإنسانية</p>
              <h2 className="font-serif text-4xl text-foreground">A Message to All Humanity</h2>
            </div>
            <ChevronDown
              className={`h-6 w-6 text-[#C9A962] transition-transform ${expandedSection === "message" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "message" && (
            <div className="space-y-8">
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="font-arabic text-2xl text-[#C9A962] mb-3">أَفْشُوا السَّلَامَ</p>
                <p className="text-foreground text-lg italic">"Spread Peace Among You"</p>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  I am just a Muslim person who believes that there is no god but Allah, and I believe in all His
                  angels, His heavenly books, all His messengers and prophets, and{" "}
                  <span className="text-[#C9A962]">I do not differentiate between any of them</span>.
                </p>

                <p className="text-muted-foreground leading-relaxed text-lg">
                  My religion is Islam—it comes from peace. My greeting is peace (السَّلَامُ عَلَيْكُمْ).
                </p>
              </div>

              <div className="glass-card rounded-xl p-8 text-center border-l-4 border-[#C9A962]">
                <p className="text-xl text-foreground leading-relaxed">
                  <strong>Enough hatred. Enough racism. Enough killing. Enough blood.</strong>
                  <br />
                  <strong>Enough bullying. Enough persecution. Enough wars.</strong>
                </p>
                <div className="w-16 h-px bg-[#C9A962]/30 mx-auto my-6" />
                <p className="text-[#C9A962] text-lg">Spread peace among you. Reveal goodness among you.</p>
                <p className="text-2xl text-foreground mt-4 font-serif">Let's be better, humanity.</p>
              </div>

              <div className="glass-card rounded-xl p-8">
                <p className="font-arabic text-xl text-[#C9A962] mb-3 text-center">إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ</p>
                <p className="text-foreground text-center italic mb-2">
                  "God has written الإحسان (excellence/goodness) on everything."
                </p>
                <p className="text-muted-foreground text-center text-sm">Hadith of Prophet Muhammad ﷺ</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Closing Prayer */}
      <section className="py-20 px-8 border-t border-[#C9A962]/10 bg-gradient-to-b from-card/30 to-[#0A1628]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-10 mb-10">
            <p className="font-arabic text-2xl text-[#C9A962] mb-4 leading-relaxed">
              الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَا أَنْ هَدَانَا اللَّهُ
            </p>
            <p className="text-foreground/80 text-lg italic mb-3">
              "All praise to Allah who guided us to this; we would not have been guided if Allah had not guided us."
            </p>
            <p className="text-muted-foreground text-sm">Qur'an 7:43</p>
          </div>

          {/* Epilogue badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A962]/30 text-[#C9A962] text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C9A962] animate-pulse" />
            31 Months Later — The Seed Grew Into a Tree
          </div>

          <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm flex-wrap">
            <span>Genesis Vision</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A962]" />
            <span>Ramadan 2023</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A962]" />
            <span>Mahmoud Hassan (MoMo)</span>
            <span className="w-1 h-1 rounded-full bg-[#C9A962]" />
            <span>For All Humanity</span>
          </div>

          {/* Navigate to Protocol */}
          <div className="mt-12">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C9A962]/10 border border-[#C9A962]/30 text-[#C9A962] hover:bg-[#C9A962]/20 transition-colors group">
              <span>Enter the Protocol</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
