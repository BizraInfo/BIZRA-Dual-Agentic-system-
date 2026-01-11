"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const outline = outlineRef.current

    if (!dot || !outline) return

    const handleMouseMove = (e: MouseEvent) => {
      const posX = e.clientX
      const posY = e.clientY

      dot.style.left = `${posX}px`
      dot.style.top = `${posY}px`
      
      outline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: "forwards" })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="hidden md:block w-2 h-2 bg-[#C9A962] rounded-full fixed pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2" />
      <div ref={outlineRef} className="hidden md:block w-10 h-10 border border-[#C9A962]/50 rounded-full fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ease-out" />
    </>
  )
}
