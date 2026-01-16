/**
 * Live Data Integration
 *
 * Connects to BIZRA backend for real-time knowledge graph updates
 * Uses SWR for client-side data fetching with automatic revalidation
 */

import useSWR from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091';

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
