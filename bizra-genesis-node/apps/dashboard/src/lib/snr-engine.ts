/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  BIZRA SNR (Signal-to-Noise Ratio) ENGINE                                    ║
 * ║  Version: 1.0.0-GENESIS                                                      ║
 * ║  Author: BIZRA Cognitive Architecture                                        ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  "Truth pays rent through measurable signal" - THE LAW                       ║
 * ║                                                                              ║
 * ║  SNR = (Verifiably Correct Actions) / (Total Compute Cycles)                 ║
 * ║  Target: SNR ≥ 0.95 (COVENANT Article II)                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import useSWR from 'swr';
import { useBizraLiveMetrics, type BizraLiveMetrics } from './live-data';

// ============================================================================
// SNR Types
// ============================================================================

export interface SNRMetrics {
  // Core SNR Score (0-1, target ≥ 0.95)
  snrScore: number;
  snrDecibels: number;

  // Signal Components
  signal: {
    ihsanScore: number;        // Ihsān quality metric
    gatePassRate: number;      // Gate pass percentage
    patEfficiency: number;     // PAT agent efficiency
    satConsensus: number;      // SAT validator consensus
    sapeOptimization: number;  // SAPE pattern gains
  };

  // Noise Components
  noise: {
    gateFailures: number;      // Failed gate checks
    rejectedRequests: number;  // Rejected by SAT
    fateEscalations: number;   // FATE escalations
    latencyOverhead: number;   // Unnecessary latency
    redundantCompute: number;  // Wasted compute cycles
  };

  // Derived Metrics
  cognitiveEfficiency: number;
  informationDensity: number;
  entropyReduction: number;

  // Historical Trend
  trend: 'improving' | 'stable' | 'degrading';
  trendDelta: number;

  // Quality Assessment
  qualityTier: 'elite' | 'professional' | 'standard' | 'degraded';
}

export interface ThoughtNode {
  id: string;
  content: string;
  type: 'premise' | 'inference' | 'abstraction' | 'synthesis' | 'conclusion';
  confidence: number;
  snrContribution: number;
  children: string[];
  parent: string | null;
  cognitiveLoad: number;
  timestamp: number;
}

export interface ThoughtGraph {
  nodes: Map<string, ThoughtNode>;
  edges: Array<{ from: string; to: string; weight: number; operation: string }>;
  rootNodes: string[];
  leafNodes: string[];
  depth: number;
  complexity: number;
  coherenceScore: number;
}

export interface CognitiveState {
  snr: SNRMetrics;
  thoughtGraph: ThoughtGraph | null;
  activeThoughts: number;
  processingDepth: number;
  memoryUtilization: number;
  attentionFocus: string[];
}

// ============================================================================
// SNR Calculation Engine
// ============================================================================

/**
 * Calculate SNR score from live metrics
 */
export function calculateSNR(metrics: BizraLiveMetrics): SNRMetrics {
  // Extract signal components
  const ihsanScore = metrics.avgIhsan || 0;
  const gatePassRate = metrics.gatesPassed > 0
    ? metrics.gatesPassed / (metrics.gatesPassed + metrics.gatesFailed)
    : 0;
  const patEfficiency = metrics.health?.agents?.pat_count
    ? (metrics.health.agents.pat_count / 7) * (metrics.health.status === 'healthy' ? 1 : 0.5)
    : 0;
  const satConsensus = metrics.health?.agents?.sat_count
    ? (metrics.health.agents.sat_count / 5) * (metrics.health.status === 'healthy' ? 1 : 0.5)
    : 0;
  const sapeOptimization = metrics.health?.sape?.total_snr_improvement || 0;

  // Calculate aggregate signal (weighted average)
  const signalWeights = {
    ihsan: 0.35,
    gates: 0.25,
    pat: 0.15,
    sat: 0.15,
    sape: 0.10,
  };

  const signalScore =
    (ihsanScore * signalWeights.ihsan) +
    (gatePassRate * signalWeights.gates) +
    (patEfficiency * signalWeights.pat) +
    (satConsensus * signalWeights.sat) +
    (Math.min(sapeOptimization, 1) * signalWeights.sape);

  // Extract noise components
  const gateFailures = metrics.gatesFailed || 0;
  const fateEscalations = metrics.fateEscalations || 0;
  const rejectedRequests = gateFailures; // Approximation
  const latencyOverhead = 0.05; // Base overhead estimate
  const redundantCompute = metrics.health?.sape?.patterns_active
    ? 1 - (metrics.health.sape.patterns_active / Math.max(metrics.health.sape.patterns_registered, 1))
    : 0.1;

  // Calculate noise factor (0-1, lower is better)
  const noiseComponents = [
    gateFailures / Math.max(metrics.gatesPassed + gateFailures, 1),
    fateEscalations / 10, // Normalized to 10 max
    latencyOverhead,
    redundantCompute * 0.5,
  ];
  const noiseFactor = noiseComponents.reduce((a, b) => a + b, 0) / noiseComponents.length;

  // Calculate SNR
  const snrScore = signalScore / Math.max(signalScore + noiseFactor, 0.001);
  const snrDecibels = 10 * Math.log10(signalScore / Math.max(noiseFactor, 0.001));

  // Derived metrics
  const cognitiveEfficiency = snrScore * patEfficiency * satConsensus;
  const informationDensity = ihsanScore * gatePassRate;
  const entropyReduction = 1 - noiseFactor;

  // Determine quality tier
  let qualityTier: SNRMetrics['qualityTier'];
  if (snrScore >= 0.95) qualityTier = 'elite';
  else if (snrScore >= 0.85) qualityTier = 'professional';
  else if (snrScore >= 0.70) qualityTier = 'standard';
  else qualityTier = 'degraded';

  return {
    snrScore,
    snrDecibels: Math.max(snrDecibels, -20), // Clamp to -20dB minimum
    signal: {
      ihsanScore,
      gatePassRate,
      patEfficiency,
      satConsensus,
      sapeOptimization: Math.min(sapeOptimization, 1),
    },
    noise: {
      gateFailures,
      rejectedRequests,
      fateEscalations,
      latencyOverhead,
      redundantCompute,
    },
    cognitiveEfficiency,
    informationDensity,
    entropyReduction,
    trend: 'stable', // Would need historical data
    trendDelta: 0,
    qualityTier,
  };
}

// ============================================================================
// SNR React Hook
// ============================================================================

/**
 * Hook for real-time SNR monitoring
 */
export function useSNRMetrics(): SNRMetrics & { isLoading: boolean; error: Error | null } {
  const liveMetrics = useBizraLiveMetrics();

  const snr = calculateSNR(liveMetrics);

  return {
    ...snr,
    isLoading: liveMetrics.isLoading,
    error: liveMetrics.error,
  };
}

/**
 * Hook for full cognitive state including SNR
 */
export function useCognitiveState(): CognitiveState & { isLoading: boolean } {
  const snrMetrics = useSNRMetrics();

  return {
    snr: snrMetrics,
    thoughtGraph: null, // Would be populated from GoT endpoint
    activeThoughts: Math.round(snrMetrics.signal.patEfficiency * 7),
    processingDepth: 3, // Default depth
    memoryUtilization: 0.65, // Would come from metrics
    attentionFocus: ['ihsan', 'safety', 'efficiency'],
    isLoading: snrMetrics.isLoading,
  };
}

// ============================================================================
// SNR Display Utilities
// ============================================================================

/**
 * Format SNR for display
 */
export function formatSNR(snr: number): string {
  return `${(snr * 100).toFixed(1)}%`;
}

/**
 * Format SNR in decibels
 */
export function formatSNRdB(snrDb: number): string {
  return `${snrDb >= 0 ? '+' : ''}${snrDb.toFixed(1)} dB`;
}

/**
 * Get SNR color based on score
 */
export function getSNRColor(snr: number): string {
  if (snr >= 0.95) return 'text-emerald-400';
  if (snr >= 0.85) return 'text-cyan-400';
  if (snr >= 0.70) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Get SNR background color
 */
export function getSNRBgColor(snr: number): string {
  if (snr >= 0.95) return 'bg-emerald-500';
  if (snr >= 0.85) return 'bg-cyan-500';
  if (snr >= 0.70) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * Get quality tier display info
 */
export function getQualityTierInfo(tier: SNRMetrics['qualityTier']): {
  label: string;
  color: string;
  icon: string;
} {
  switch (tier) {
    case 'elite':
      return { label: 'ELITE', color: 'text-emerald-400', icon: '◆' };
    case 'professional':
      return { label: 'PROFESSIONAL', color: 'text-cyan-400', icon: '●' };
    case 'standard':
      return { label: 'STANDARD', color: 'text-amber-400', icon: '○' };
    case 'degraded':
      return { label: 'DEGRADED', color: 'text-red-400', icon: '✕' };
  }
}
