"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import * as THREE from "three"
import { SacredHeading, SacredTagline, SacredLogo, COLORS, FONTS } from "@/lib/design-system"

export function GenesisHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // THREE.JS Background
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Particles
    const geometry = new THREE.BufferGeometry()
    const particlesCount = 700
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))

    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: Number.parseInt(COLORS.gold[500].replace("#", "0x")),
      transparent: true,
      opacity: 0.8,
    })

    const particlesMesh = new THREE.Points(geometry, material)
    scene.add(particlesMesh)

    camera.position.z = 3

    // Animation Loop
    const clock = new THREE.Clock()
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.001
      mouseY = (event.clientY - window.innerHeight / 2) * 0.001
    }

    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      particlesMesh.rotation.y = 0.2 * elapsedTime
      particlesMesh.rotation.x += 0.05 * (mouseY - particlesMesh.rotation.x)
      particlesMesh.rotation.y += 0.05 * (mouseX - particlesMesh.rotation.y)
      particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    // GSAP Animations for Logo Construction
    const tl = gsap.timeline({ delay: 0.5 })

    tl.to(".seed-circle", {
      opacity: 1,
      stagger: 0.1,
      duration: 1,
      ease: "power2.out",
    })
      .from(
        ".seed-circle",
        {
          strokeDashoffset: 300,
          strokeDasharray: 300,
          duration: 1.5,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        "<",
      )
      .to(
        "#outer-ring",
        {
          opacity: 0.5,
          duration: 1,
        },
        "-=0.5",
      )
      .to(".logo-petal", {
        opacity: 1,
        duration: 1,
        stagger: 0.1,
      })
      .from(
        ".logo-petal",
        {
          strokeDashoffset: 100,
          strokeDasharray: 100,
          duration: 1.5,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=1",
      )
      .to(
        ".seed-circle",
        {
          opacity: 0.2,
          strokeWidth: 0.25,
          duration: 1,
        },
        "-=0.5",
      )
      .to(".logo-dot", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        transformOrigin: "center",
      })
      .to(
        "#hero-arabic",
        {
          opacity: 0.2,
          scale: 1,
          duration: 2,
          ease: "power3.out",
        },
        "-=1",
      )
      .to(
        ".hero-title",
        {
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=1.5",
      )
      .to(
        ".hero-badge",
        {
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=1.2",
      )
      .to(
        "#hero-desc",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.8",
      )

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section
      id="genesis"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: COLORS.navy[900] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40" />

      <div className="z-10 text-center relative px-4 flex flex-col items-center" ref={containerRef}>
        {/* SVG Logo Animation Container */}
        <div className="w-64 h-64 md:w-80 md:h-80 mb-8 relative">
          <SacredLogo size="lg" animate />
        </div>

        {/* Titles */}
        <div className="mb-4 overflow-hidden">
          <SacredTagline
            className="hero-badge border px-4 py-2 rounded-full inline-block transform translate-y-full"
            style={{ borderColor: `${COLORS.gold[500]}30` }}
          >
            Genesis Vision 2025
          </SacredTagline>
        </div>

        <h1
          className={`text-7xl md:text-9xl ${FONTS.arabic} mb-2 leading-tight mix-blend-overlay opacity-0 scale-90`}
          id="hero-arabic"
          style={{ color: COLORS.gold[500] }}
        >
          البذرة
        </h1>

        <div className="overflow-hidden">
          <SacredHeading level={2} className="hero-title transform translate-y-full font-light">
            The Seed
          </SacredHeading>
        </div>

        <div className="mt-8 max-w-xl mx-auto text-white/60 font-light leading-relaxed opacity-0" id="hero-desc">
          From the darkness of a single room to the light of a global system.
          <br />
          <span className="italic" style={{ color: COLORS.gold[500] }}>
            "I always ask the impossible from Allah."
          </span>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-pulse">
          <SacredTagline className="text-[10px]">Scroll to Explore</SacredTagline>
          <div
            className="w-[1px] h-12 bg-gradient-to-b from-current to-transparent"
            style={{ color: COLORS.gold[500] }}
          ></div>
        </div>
      </div>
    </section>
  )
}
