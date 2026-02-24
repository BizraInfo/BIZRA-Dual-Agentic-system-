/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  BIZRA VERCEL EDGE API PROXY                                                 ║
 * ║  Version: 1.0.0-PEAK-MASTERPIECE                                             ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Resolves P0 BLOCKER: Production frontend cannot reach localhost:9091        ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  - Vercel Edge Function acts as secure proxy to backend                      ║
 * ║  - Zero-trust: Backend remains private, only proxy exposes endpoints         ║
 * ║  - Supports: /health, /metrics, /api/* endpoints                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend URL - configurable via environment variable
// For production, set BIZRA_BACKEND_URL to your deployed backend
const BACKEND_URL = process.env.BIZRA_BACKEND_URL || 'http://localhost:9091';

// Allowed paths for security (whitelist approach)
const ALLOWED_PATHS = [
  '/health',
  '/metrics',
  '/api/knowledge/stats',
  '/api/knowledge/daily-insight',
  '/api/knowledge/discoveries',
  '/api/knowledge/recent',
  '/api/knowledge/graph',
  '/api/knowledge/search',
  '/api/knowledge/discover',
];

// Rate limiting (simple in-memory - for production use Redis/Upstash)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function isPathAllowed(path: string): boolean {
  // Check exact matches first
  if (ALLOWED_PATHS.includes(path)) {
    return true;
  }

  // Check prefix matches for /api/* routes
  return ALLOWED_PATHS.some((allowed) =>
    path.startsWith(allowed) || allowed.startsWith(path.split('?')[0])
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = '/' + path.join('/');

  // Security: Check if path is allowed
  if (!isPathAllowed(targetPath)) {
    return NextResponse.json(
      { error: 'Path not allowed', path: targetPath },
      { status: 403 }
    );
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    // Forward request to backend
    const backendUrl = `${BACKEND_URL}${targetPath}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BIZRA-Edge-Proxy/1.0',
      },
      // Short timeout to prevent hanging
      signal: AbortSignal.timeout(10000),
    });

    // Handle non-JSON responses (like /metrics which is text/plain)
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/plain')) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);

    // Return fallback data for /health to prevent complete frontend failure
    if (targetPath === '/health') {
      return NextResponse.json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        agents: { pat_count: 7, sat_count: 5, total: 12 },
        gates: {
          ihsan: 'unknown',
          performance: 'unknown',
          quality: 'unknown',
          security: 'unknown',
        },
        ihsan: {
          constitution_id: 'genesis-v1',
          dimensions_count: 8,
          enforcement_active: true,
          env: 'production',
          threshold_baseline: 0.8,
          threshold_ci: 0.9,
          threshold_production: 0.95,
        },
        sape: {
          patterns_active: 0,
          patterns_registered: 0,
          pending_elevations: 0,
          sequences_observed: 0,
          total_latency_saved_ms: 0,
          total_snr_improvement: 0,
          unique_sequences: 0,
        },
        _proxy_fallback: true,
        _error: 'Backend unreachable',
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return NextResponse.json(
      {
        error: 'Backend unreachable',
        message: error instanceof Error ? error.message : 'Unknown error',
        _proxy_error: true,
      },
      { status: 503 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = '/' + path.join('/');

  // Security: Check if path is allowed
  if (!isPathAllowed(targetPath)) {
    return NextResponse.json(
      { error: 'Path not allowed', path: targetPath },
      { status: 403 }
    );
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const backendUrl = `${BACKEND_URL}${targetPath}`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BIZRA-Edge-Proxy/1.0',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json(
      {
        error: 'Backend unreachable',
        message: error instanceof Error ? error.message : 'Unknown error',
        _proxy_error: true,
      },
      { status: 503 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
