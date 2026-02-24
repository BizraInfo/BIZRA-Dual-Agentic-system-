"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export function GenesisLoader() {
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.to('.reveal-text', {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 0.8,
      ease: "power3.out"
    })
    .to('.reveal-dot', {
      opacity: 1,
      stagger: 0.2,
      duration: 0.5
    }, "-=0.5")
    .to('#loader-bar', {
      scaleX: 1,
      duration: 1.5,
      ease: "expo.inOut"
    })
    .to(loaderRef.current, {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      delay: 0.5
    })
  }, [])

  return (
    <div ref={loaderRef} className="fixed inset-0 bg-[#050B14] z-[100] flex justify-center items-center flex-col">
      <div className="flex items-center gap-4 font-arabic text-4xl text-[#C9A962] mb-4">
        <span className="opacity-0 reveal-text translate-y-4">البذرة</span>
        <span className="w-2 h-2 bg-[#C9A962] rounded-full opacity-0 reveal-dot"></span>
        <span className="opacity-0 reveal-text translate-y-4">الرسالة</span>
        <span className="w-2 h-2 bg-[#C9A962] rounded-full opacity-0 reveal-dot"></span>
        <span className="opacity-0 reveal-text translate-y-4">الرؤية</span>
      </div>
      <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-full bg-[#C9A962] origin-left transform scale-x-0" id="loader-bar"></div>
      </div>
    </div>
  )
}
