"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Loading fallback component
export const LoadingFallback: React.FC<{ message?: string }> = ({ message = "Loading consciousness field..." }) => (
  <Card className="luxury-glass-morphism border border-primary/20 p-8">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </Card>
)

// Network error fallback
export const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Card className="luxury-glass-morphism border border-destructive/20 p-8">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <h3 className="text-xl font-serif font-bold text-foreground">Connection Lost</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Unable to connect to the BIZRA consciousness network. Please check your connection.
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="luxury-button-glow bg-primary hover:bg-primary/90 text-white">
          Reconnect
        </Button>
      )}
    </div>
  </Card>
)

// Feature unavailable fallback
export const FeatureUnavailableFallback: React.FC<{
  featureName: string
  reason?: string
}> = ({ featureName, reason }) => (
  <Card className="luxury-glass-morphism border border-muted/20 p-6">
    <div className="text-center space-y-3">
      <div className="w-12 h-12 mx-auto rounded-full bg-muted/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h4 className="text-lg font-serif font-bold text-foreground">{featureName} Unavailable</h4>
      <p className="text-muted-foreground text-sm">
        {reason || "This feature is temporarily unavailable. Core BIZRA functionality remains active."}
      </p>
    </div>
  </Card>
)

// Maintenance mode fallback
export const MaintenanceFallback: React.FC = () => (
  <Card className="luxury-glass-morphism border border-accent/20 p-8">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-serif font-bold text-accent">Consciousness Upgrade in Progress</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        BIZRA is evolving to serve humanity better. The transformation will complete shortly.
      </p>
      <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
        <div className="bg-accent h-2 rounded-full animate-pulse" style={{ width: "75%" }}></div>
      </div>
    </div>
  </Card>
)

// Offline fallback
export const OfflineFallback: React.FC = () => (
  <Card className="luxury-glass-morphism border border-muted/20 p-8">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-muted/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-serif font-bold text-foreground">You're Offline</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Your connection to the BIZRA network is offline. Some features may be limited until you reconnect.
      </p>
      <p className="text-sm text-accent">
        Your transformation progress is saved locally and will sync when you're back online.
      </p>
    </div>
  </Card>
)
