/**
 * Live Data Integration
 *
 * Connects to BIZRA backend for real-time knowledge graph updates
 * Uses SWR for client-side data fetching with automatic revalidation
 */

import useSWR from 'swr';

/**
 * API URL Configuration
 *
 * Priority:
 * 1. NEXT_PUBLIC_API_URL env var (explicit backend URL)
 * 2. NEXT_PUBLIC_USE_PROXY=true -> use /api/proxy route
 * 3. Production (non-localhost) -> auto-use proxy
 * 4. Development -> localhost:9091
 */
function getApiUrl(): string {
  // Explicit backend URL takes priority
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Check if we should use the proxy
  const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true';

  // In browser, detect if we're in production
  if (typeof window !== 'undefined') {
    const isProduction = !window.location.hostname.includes('localhost');
    if (isProduction || useProxy) {
      // Use the Edge API proxy
      return '/api/proxy';
    }
  }

  // Default to localhost for development
  return 'http://localhost:9091';
}

const API_URL = getApiUrl();

// ============================================================================
// Types
// ============================================================================

export interface GraphStats {
  total_nodes: number;
  total_relationships: number;
  quranic_verses: number;
  hadith_count: number;
  insights: number;
  categories: Record<string, number>;
  last_updated: string;
}

export interface DailyInsight {
  id: string;
  category: 'vision' | 'philosophy' | 'technical' | 'learning' | 'insight';
  header: string;
  content: string;
  arabic?: string;
  source: string;
  confidence: number;
  word_count: number;
  contains_arabic: boolean;
}

export interface PatternDiscovery {
  id: string;
  type: 'mathematical' | 'linguistic' | 'scientific' | 'cross_reference';
  description: string;
  evidence: string[];
  significance: number;
  discovered_at: string;
  proof?: any;
}

export interface RecentInsight {
  id: string;
  header: string;
  category: string;
  source_file: string;
  timestamp: string;
}

export interface GraphNode {
  node_id: string;
  node_type: string;
  properties: Record<string, any>;
  labels: string[];
  source?: string;
  confidence: number;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: any[];
  metadata: {
    total_nodes: number;
    total_relationships: number;
  };
}

// ============================================================================
// Fetcher Functions
// ============================================================================

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ============================================================================
// Live Data Hooks
// ============================================================================

/**
 * Fetch live knowledge graph statistics
 * Updates every 5 seconds
 */
export function useGraphStats() {
  return useSWR<GraphStats>(
    `${API_URL}/api/knowledge/stats`,
    fetcher,
    {
      refreshInterval: 5000, // 5 seconds
      dedupingInterval: 2000,
      revalidateOnFocus: true,
      fallbackData: {
        total_nodes: 221,
        total_relationships: 201,
        quranic_verses: 6236,
        hadith_count: 34178,
        insights: 221,
        categories: {
          vision: 9,
          philosophy: 9,
          technical: 8,
          learning: 1,
          insight: 174,
        },
        last_updated: new Date().toISOString(),
      },
    }
  );
}

/**
 * Fetch daily insight
 * Changes once per day
 */
export function useDailyInsight() {
  return useSWR<DailyInsight>(
    `${API_URL}/api/knowledge/daily-insight`,
    fetcher,
    {
      refreshInterval: 3600000, // 1 hour
      revalidateOnFocus: false,
      dedupingInterval: 3600000,
    }
  );
}

/**
 * Fetch recent pattern discoveries
 * Updates every 10 seconds
 */
export function useRecentDiscoveries(limit: number = 10) {
  return useSWR<PatternDiscovery[]>(
    `${API_URL}/api/knowledge/discoveries?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 10000, // 10 seconds
      dedupingInterval: 5000,
    }
  );
}

/**
 * Fetch recent insights (new additions to graph)
 * Updates every 30 seconds
 */
export function useRecentInsights(limit: number = 10) {
  return useSWR<RecentInsight[]>(
    `${API_URL}/api/knowledge/recent?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      dedupingInterval: 15000,
    }
  );
}

/**
 * Fetch full graph data for visualization
 * Updates every minute
 */
export function useGraphData() {
  return useSWR<GraphData>(
    `${API_URL}/api/knowledge/graph`,
    fetcher,
    {
      refreshInterval: 60000, // 1 minute
      dedupingInterval: 30000,
      revalidateOnFocus: false,
    }
  );
}

/**
 * Search knowledge graph
 */
export async function searchKnowledgeGraph(query: string, limit: number = 20) {
  const res = await fetch(`${API_URL}/api/knowledge/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Query specific pattern (mathematical, linguistic, etc.)
 */
export async function queryPattern(
  verse: string,
  patternType: 'mathematical' | 'linguistic' | 'scientific' | 'all'
) {
  const res = await fetch(`${API_URL}/api/knowledge/discover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ verse, pattern_type: patternType }),
  });

  if (!res.ok) {
    throw new Error(`Pattern query failed: ${res.statusText}`);
  }

  return res.json();
}

// ============================================================================
// BIZRA Core Metrics Types (Money Shot Data)
// ============================================================================

export interface BizraHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  agents: {
    pat_count: number;
    sat_count: number;
    total: number;
  };
  gates: {
    ihsan: string;
    performance: string;
    quality: string;
    security: string;
  };
  ihsan: {
    constitution_id: string;
    dimensions_count: number;
    enforcement_active: boolean;
    env: string;
    threshold_baseline: number;
    threshold_ci: number;
    threshold_production: number;
  };
  sape: {
    patterns_active: number;
    patterns_registered: number;
    pending_elevations: number;
    sequences_observed: number;
    total_latency_saved_ms: number;
    total_snr_improvement: number;
    unique_sequences: number;
  };
}

export interface IhsanDimension {
  dimension: string;
  score: number;
}

export interface PrometheusMetric {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface BizraLiveMetrics {
  health: BizraHealth | null;
  ihsanDimensions: IhsanDimension[];
  gatesPassed: number;
  gatesFailed: number;
  httpRequests: number;
  ollamaConnected: boolean;
  fateEscalations: number;
  avgIhsan: number;
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// Core BIZRA Live Metrics Hooks
// ============================================================================

/**
 * Fetch BIZRA health status
 * Updates every 2 seconds for real-time feel
 */
export function useBizraHealth() {
  return useSWR<BizraHealth>(
    `${API_URL}/health`,
    fetcher,
    {
      refreshInterval: 2000, // 2 seconds
      dedupingInterval: 1000,
      revalidateOnFocus: true,
    }
  );
}

/**
 * Parse Prometheus metrics text format
 */
function parsePrometheusMetrics(text: string): Map<string, PrometheusMetric[]> {
  const metrics = new Map<string, PrometheusMetric[]>();
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;

    // Parse metric line: metric_name{label="value"} value
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\{([^}]*)\})?\s+(.+)$/);
    if (match) {
      const [, name, labelsStr, valueStr] = match;
      const value = parseFloat(valueStr);

      if (isNaN(value)) continue;

      const labels: Record<string, string> = {};
      if (labelsStr) {
        const labelMatches = labelsStr.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g);
        for (const m of labelMatches) {
          labels[m[1]] = m[2];
        }
      }

      const existing = metrics.get(name) || [];
      existing.push({ name, value, labels });
      metrics.set(name, existing);
    }
  }

  return metrics;
}

/**
 * Fetch raw Prometheus metrics
 */
async function fetchMetrics(): Promise<Map<string, PrometheusMetric[]>> {
  const res = await fetch(`${API_URL}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  const text = await res.text();
  return parsePrometheusMetrics(text);
}

/**
 * Combined hook for all live BIZRA metrics (Money Shot data)
 * This is the main hook for the investor dashboard
 */
export function useBizraLiveMetrics(): BizraLiveMetrics {
  const { data: health, error: healthError, isLoading: healthLoading } = useBizraHealth();

  const { data: metricsMap, error: metricsError } = useSWR(
    'prometheus-metrics',
    fetchMetrics,
    {
      refreshInterval: 3000,
      dedupingInterval: 1500,
    }
  );

  // Extract Ihsān dimension scores
  const ihsanDimensions: IhsanDimension[] = [];
  if (metricsMap) {
    const dimensionMetrics = metricsMap.get('bizra_ihsan_dimension_score') || [];
    for (const m of dimensionMetrics) {
      if (m.labels?.dimension) {
        ihsanDimensions.push({
          dimension: m.labels.dimension,
          score: m.value,
        });
      }
    }
  }

  // Extract gate results
  let gatesPassed = 0;
  let gatesFailed = 0;
  if (metricsMap) {
    const gateMetrics = metricsMap.get('bizra_ihsan_gate_total') || [];
    for (const m of gateMetrics) {
      if (m.labels?.result === 'passed') gatesPassed = m.value;
      if (m.labels?.result === 'failed') gatesFailed = m.value;
    }
  }

  // Extract HTTP requests
  const httpRequests = metricsMap?.get('bizra_http_requests_allowed_total')?.[0]?.value || 0;

  // Extract Ollama status
  const ollamaConnected = (metricsMap?.get('bizra_ollama_connected')?.[0]?.value || 0) === 1;

  // Extract FATE escalations
  const fateEscalations = metricsMap?.get('bizra_fate_pending_escalations')?.[0]?.value || 0;

  // Calculate average Ihsān
  const avgIhsan = ihsanDimensions.length > 0
    ? ihsanDimensions.reduce((sum, d) => sum + d.score, 0) / ihsanDimensions.length
    : 0;

  return {
    health: health || null,
    ihsanDimensions,
    gatesPassed,
    gatesFailed,
    httpRequests,
    ollamaConnected,
    fateEscalations,
    avgIhsan,
    isLoading: healthLoading,
    error: healthError || metricsError || null,
  };
}

// ============================================================================
// Domain Detection Helpers
// ============================================================================

export function getDomainType(): 'ai' | 'info' {
  if (typeof window === 'undefined') return 'info';

  const hostname = window.location.hostname;
  if (hostname.includes('bizra.ai')) return 'ai';
  return 'info';
}

export function isTechnicalDomain(): boolean {
  return getDomainType() === 'ai';
}

export function isPublicDomain(): boolean {
  return getDomainType() === 'info';
}
