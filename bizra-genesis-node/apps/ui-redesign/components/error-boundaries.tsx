"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { analytics } from "@/components/real-time-analytics"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

// Main Error Boundary Component
export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to analytics
    analytics.track("error_boundary_triggered", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[v0] Error Boundary caught an error:", error, errorInfo)
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      analytics.track("error_boundary_retry", {
        retryCount: this.state.retryCount + 1,
        error: this.state.error?.message,
      })

      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Card className="luxury-glass-morphism border border-destructive/20 p-8 m-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-serif font-bold text-foreground">Something went wrong</h3>

            <p className="text-muted-foreground max-w-md mx-auto">
              We encountered an unexpected error. The BIZRA consciousness field is working to restore harmony.
            </p>

            {this.state.retryCount < this.maxRetries && (
              <Button
                onClick={this.handleRetry}
                className="luxury-button-glow bg-primary hover:bg-primary/90 text-white"
              >
                Try Again ({this.maxRetries - this.state.retryCount} attempts left)
              </Button>
            )}

            {this.state.retryCount >= this.maxRetries && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Maximum retry attempts reached. Please refresh the page.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="luxury-button-glow bg-accent hover:bg-accent/90 text-primary"
                >
                  Refresh Page
                </Button>
              </div>
            )}

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">Error Details (Development)</summary>
                <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

// Specialized Error Boundaries for different sections
export const ConsciousnessErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <Card className="luxury-glass-morphism border border-primary/20 p-6 m-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary animate-pulse" />
          </div>
          <h4 className="text-lg font-serif font-bold text-primary">Consciousness Field Recalibrating</h4>
          <p className="text-muted-foreground text-sm">
            The consciousness interface is temporarily offline. Your transformation journey continues.
          </p>
        </div>
      </Card>
    }
    onError={(error) => {
      analytics.trackConsciousnessInteraction("error", 0)
    }}
  >
    {children}
  </ErrorBoundary>
)

export const QuantumErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <Card className="luxury-glass-morphism border border-accent/20 p-6 m-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <h4 className="text-lg font-serif font-bold text-accent">Quantum Field Stabilizing</h4>
          <p className="text-muted-foreground text-sm">
            The quantum consciousness field is realigning. Reality will resume shortly.
          </p>
        </div>
      </Card>
    }
    onError={(error) => {
      analytics.trackQuantumFieldEngagement(0, 0)
    }}
  >
    {children}
  </ErrorBoundary>
)

export const AIErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <Card className="luxury-glass-morphism border border-secondary/20 p-6 m-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-serif font-bold text-secondary">AI Systems Recalibrating</h4>
          <p className="text-muted-foreground text-sm">
            Your AI agents are temporarily offline. Core BIZRA functionality remains active.
          </p>
        </div>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// Async Error Boundary for handling promise rejections
export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    }
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", this.handlePromiseRejection)
  }

  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.handlePromiseRejection)
  }

  handlePromiseRejection = (event: PromiseRejectionEvent) => {
    analytics.track("unhandled_promise_rejection", {
      reason: event.reason?.toString(),
      stack: event.reason?.stack,
    })

    console.error("[v0] Unhandled promise rejection:", event.reason)

    // Prevent the default browser behavior
    event.preventDefault()

    // Update state to show error UI
    this.setState({
      hasError: true,
      error: new Error(`Async operation failed: ${event.reason}`),
      retryCount: 0,
    })
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    analytics.track("async_error_boundary_triggered", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="luxury-glass-morphism border border-destructive/20 p-6 m-4">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-serif font-bold text-foreground">Network Operation Failed</h4>
            <p className="text-muted-foreground text-sm">
              A background operation encountered an issue. The main experience continues normally.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              size="sm"
              className="luxury-button-glow bg-primary hover:bg-primary/90 text-white"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    analytics.track("manual_error_handled", {
      error: error.message,
      context,
      stack: error.stack,
    })

    console.error(`[v0] Error in ${context || "component"}:`, error)

    // In a real app, you might want to show a toast notification
    // or update some global error state here
  }, [])

  return handleError
}

// Utility function for safe async operations
export const safeAsync = async <T,>(operation: () => Promise<T>, fallback: T, context?: string): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    analytics.track("safe_async_fallback", {
      error: error instanceof Error ? error.message : "Unknown error",
      context,
    })

    console.error(`[v0] Safe async operation failed in ${context}:`, error)
    return fallback
  }
}

// Component for graceful image loading with fallbacks
export const SafeImage: React.FC<{
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  width?: number
  height?: number
}> = ({ src, alt, fallbackSrc, className, width, height }) => {
  const [imageSrc, setImageSrc] = React.useState(src)
  const [hasError, setHasError] = React.useState(false)

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setImageSrc(fallbackSrc)
      setHasError(true)
    } else {
      analytics.track("image_load_failed", { src, fallbackSrc })
    }
  }

  return (
    <img
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
      loading="lazy"
    />
  )
}
