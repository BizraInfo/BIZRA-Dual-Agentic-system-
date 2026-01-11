"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { analytics } from "@/components/real-time-analytics"

// Feature detection hook
export const useFeatureDetection = () => {
  const [features, setFeatures] = useState({
    webGL: false,
    webXR: false,
    intersectionObserver: false,
    resizeObserver: false,
    webAnimations: false,
    cssCustomProperties: false,
    serviceWorker: false,
    webAssembly: false,
    webRTC: false,
    geolocation: false,
    deviceMotion: false,
    touchSupport: false,
    hoverSupport: false,
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
  })

  useEffect(() => {
    const detectFeatures = () => {
      const detectedFeatures = {
        webGL: !!window.WebGLRenderingContext,
        webXR: "xr" in navigator,
        intersectionObserver: "IntersectionObserver" in window,
        resizeObserver: "ResizeObserver" in window,
        webAnimations: "animate" in document.createElement("div"),
        cssCustomProperties: CSS.supports("color", "var(--test)"),
        serviceWorker: "serviceWorker" in navigator,
        webAssembly: "WebAssembly" in window,
        webRTC: "RTCPeerConnection" in window,
        geolocation: "geolocation" in navigator,
        deviceMotion: "DeviceMotionEvent" in window,
        touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        hoverSupport: window.matchMedia("(hover: hover)").matches,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        highContrast: window.matchMedia("(prefers-contrast: high)").matches,
        darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
      }

      setFeatures(detectedFeatures)

      // Log feature support for analytics
      analytics.track("feature_detection", detectedFeatures)
    }

    detectFeatures()

    // Listen for media query changes
    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-contrast: high)"),
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(hover: hover)"),
    ]

    const handleMediaChange = () => detectFeatures()

    mediaQueries.forEach((mq) => {
      mq.addEventListener("change", handleMediaChange)
    })

    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener("change", handleMediaChange)
      })
    }
  }, [])

  return features
}

// Offline detection and handling
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setWasOffline(true)
        analytics.track("went_offline", { timestamp: Date.now() })
      } else if (wasOffline) {
        analytics.track("came_back_online", { timestamp: Date.now() })
      }
    }

    updateOnlineStatus()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

// Advanced keyboard navigation
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsKeyboardUser(true)
        document.body.classList.add("keyboard-navigation")
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
      document.body.classList.remove("keyboard-navigation")
    }

    const handleFocus = (e: FocusEvent) => {
      setFocusedElement(e.target as HTMLElement)
    }

    const handleBlur = () => {
      setFocusedElement(null)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("focusin", handleFocus)
    document.addEventListener("focusout", handleBlur)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("focusin", handleFocus)
      document.removeEventListener("focusout", handleBlur)
    }
  }, [])

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector("main")
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return { isKeyboardUser, focusedElement, skipToContent }
}

// User preferences management
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: "medium",
    theme: "auto",
    soundEnabled: true,
    animationsEnabled: true,
  })

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("bizra-preferences")
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("[v0] Failed to parse user preferences:", error)
      }
    }

    // Detect system preferences
    const systemPreferences = {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      highContrast: window.matchMedia("(prefers-contrast: high)").matches,
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    }

    setPreferences((prev) => ({
      ...prev,
      ...systemPreferences,
    }))
  }, [])

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences((prev) => {
      const newPreferences = { ...prev, [key]: value }

      // Save to localStorage
      try {
        localStorage.setItem("bizra-preferences", JSON.stringify(newPreferences))
      } catch (error) {
        console.error("[v0] Failed to save user preferences:", error)
      }

      analytics.track("preference_updated", { key, value })

      return newPreferences
    })
  }, [])

  return { preferences, updatePreference }
}

// Progressive enhancement wrapper component
export const ProgressiveEnhancement: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredFeatures?: string[]
}> = ({ children, fallback, requiredFeatures = [] }) => {
  const features = useFeatureDetection()
  const [canEnhance, setCanEnhance] = useState(false)

  useEffect(() => {
    const hasRequiredFeatures = requiredFeatures.every((feature) => features[feature as keyof typeof features])
    setCanEnhance(hasRequiredFeatures)
  }, [features, requiredFeatures])

  if (!canEnhance && fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Accessibility announcer for screen readers
export const useAccessibilityAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute("aria-live", priority)
      announcerRef.current.textContent = message

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ""
        }
      }, 1000)
    }

    analytics.track("accessibility_announcement", { message, priority })
  }, [])

  const AnnouncerComponent = useCallback(
    () => (
      <div
        ref={announcerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
        aria-label="Status announcements"
      />
    ),
    [],
  )

  return { announce, AnnouncerComponent }
}

// Advanced focus management
export const useFocusManagement = () => {
  const focusStack = useRef<HTMLElement[]>([])

  const pushFocus = useCallback((element: HTMLElement) => {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus) {
      focusStack.current.push(currentFocus)
    }
    element.focus()
  }, [])

  const popFocus = useCallback(() => {
    const previousFocus = focusStack.current.pop()
    if (previousFocus) {
      previousFocus.focus()
    }
  }, [])

  const trapFocus = useCallback(
    (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }

        if (e.key === "Escape") {
          popFocus()
        }
      }

      container.addEventListener("keydown", handleKeyDown)

      return () => {
        container.removeEventListener("keydown", handleKeyDown)
      }
    },
    [popFocus],
  )

  return { pushFocus, popFocus, trapFocus }
}

// Service worker registration and management
export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      setIsSupported(true)

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          setIsRegistered(true)
          analytics.track("service_worker_registered", { scope: registration.scope })

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                  analytics.track("service_worker_update_available")
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("[v0] Service worker registration failed:", error)
          analytics.track("service_worker_registration_failed", { error: error.message })
        })
    }
  }, [])

  const updateServiceWorker = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update()
        window.location.reload()
      })
    }
  }, [])

  return { isSupported, isRegistered, updateAvailable, updateServiceWorker }
}

// Device capabilities detection
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    memory: 0,
    cores: 0,
    connection: "unknown",
    battery: null as any,
    orientation: "unknown",
    pixelRatio: 1,
    colorGamut: "srgb",
    hdr: false,
  })

  useEffect(() => {
    const detectCapabilities = async () => {
      const newCapabilities = { ...capabilities }

      // Memory
      if ("memory" in navigator) {
        newCapabilities.memory = (navigator as any).memory.deviceMemory || 0
      }

      // CPU cores
      newCapabilities.cores = navigator.hardwareConcurrency || 0

      // Network connection
      if ("connection" in navigator) {
        const connection = (navigator as any).connection
        newCapabilities.connection = connection.effectiveType || "unknown"
      }

      // Battery
      if ("getBattery" in navigator) {
        try {
          newCapabilities.battery = await (navigator as any).getBattery()
        } catch (error) {
          // Battery API not available
        }
      }

      // Screen orientation
      if ("orientation" in screen) {
        newCapabilities.orientation = (screen as any).orientation.type || "unknown"
      }

      // Pixel ratio
      newCapabilities.pixelRatio = window.devicePixelRatio || 1

      // Color gamut
      if (window.matchMedia("(color-gamut: p3)").matches) {
        newCapabilities.colorGamut = "p3"
      } else if (window.matchMedia("(color-gamut: rec2020)").matches) {
        newCapabilities.colorGamut = "rec2020"
      }

      // HDR support
      newCapabilities.hdr = window.matchMedia("(dynamic-range: high)").matches

      setCapabilities(newCapabilities)
      analytics.track("device_capabilities_detected", newCapabilities)
    }

    detectCapabilities()
  }, [])

  return capabilities
}

// Skip links component for accessibility
export const SkipLinks: React.FC = () => {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded luxury-focus"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded luxury-focus"
      >
        Skip to navigation
      </a>
    </div>
  )
}

// Progressive enhancement provider
export const ProgressiveEnhancementProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const features = useFeatureDetection()
  const { preferences } = useUserPreferences()
  const { isOnline } = useOfflineSupport()
  const { announce, AnnouncerComponent } = useAccessibilityAnnouncer()

  useEffect(() => {
    // Apply user preferences to document
    document.documentElement.style.setProperty("--user-font-size", preferences.fontSize)

    if (preferences.highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    if (preferences.reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }
  }, [preferences])

  useEffect(() => {
    // Announce connection status changes
    if (!isOnline) {
      announce("You are now offline. Some features may be limited.", "assertive")
    }
  }, [isOnline, announce])

  return (
    <>
      <SkipLinks />
      <AnnouncerComponent />
      {children}
    </>
  )
}

// AccessibilityEnhancer component
export const AccessibilityEnhancer: React.FC = () => {
  const { preferences } = useUserPreferences()
  const { isKeyboardUser } = useKeyboardNavigation()

  useEffect(() => {
    // Apply accessibility enhancements based on user preferences
    if (preferences.highContrast) {
      document.body.classList.add("high-contrast-mode")
    } else {
      document.body.classList.remove("high-contrast-mode")
    }

    if (preferences.reducedMotion) {
      document.body.classList.add("reduced-motion-mode")
    } else {
      document.body.classList.remove("reduced-motion-mode")
    }

    if (isKeyboardUser) {
      document.body.classList.add("keyboard-user")
    } else {
      document.body.classList.remove("keyboard-user")
    }
  }, [preferences, isKeyboardUser])

  return null // This component only applies classes, no visual output
}

// OfflineIndicator component
export const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline } = useOfflineSupport()

  if (isOnline && !wasOffline) {
    return null
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border transition-all duration-500 ${
        isOnline ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-sm font-medium">Offline mode</span>
        </div>
      )}
    </div>
  )
}

// useProgressiveEnhancement hook alias for better naming
export const useProgressiveEnhancement = () => {
  const features = useFeatureDetection()

  return {
    supportsWebXR: features.webXR,
    supportsAdvancedAnimations: features.webAnimations && !features.reducedMotion,
    supportsWebGL: features.webGL,
    supportsServiceWorker: features.serviceWorker,
    isHighPerformance: features.webGL && features.webAssembly,
    isTouchDevice: features.touchSupport,
    hasHoverSupport: features.hoverSupport,
    prefersReducedMotion: features.reducedMotion,
    prefersHighContrast: features.highContrast,
    prefersDarkMode: features.darkMode,
    ...features,
  }
}
