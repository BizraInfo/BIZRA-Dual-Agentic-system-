"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function GenesisMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!marqueeRef.current) return

    gsap.to(marqueeRef.current, {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: marqueeRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      } 
    })
  }, [])

  return (
    <div className="py-12 border-y border-white/5 bg-[#050B14]/50 backdrop-blur-sm overflow-hidden whitespace-nowrap relative z-20">
      <div ref={marqueeRef} className="flex gap-16 text-6xl md:text-8xl font-bold text-stroke-gold opacity-20 font-serif w-[200%]">
        <span>FROM DARKNESS TO LIGHT</span>
        <span className="font-arabic">من الظلمات إلى النور</span>
        <span>FROM PAIN TO HEALING</span>
        <span className="font-arabic">من الألم إلى الشفاء</span>
        <span>FROM SEED TO TREE</span>
        <span className="font-arabic">من البذرة إلى الشجرة</span>
        <span>FROM DARKNESS TO LIGHT</span>
        <span className="font-arabic">من الظلمات إلى النور</span>
      </div>
    </div>
  )
}
