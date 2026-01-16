import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Domain-Aware Middleware
 *
 * Differentiates experience between:
 * - bizra.ai (Technical/Developer Portal)
 * - bizra.info (Public/Knowledge Gateway)
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Determine domain type
  const isTechnical = hostname.includes('bizra.ai');
  const isPublic = hostname.includes('bizra.info') || hostname.includes('localhost');

  // Set domain context in headers for downstream components
  const response = NextResponse.next();
  response.headers.set('x-bizra-domain', isTechnical ? 'ai' : 'info');

  // Store domain preference in cookie
  response.cookies.set('bizra-domain', isTechnical ? 'ai' : 'info', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // Route to domain-specific onboarding
  if (pathname === '/onboarding') {
    if (isTechnical) {
      return NextResponse.rewrite(new URL('/onboarding/technical', request.url));
    } else {
      return NextResponse.rewrite(new URL('/onboarding/seeker', request.url));
    }
  }

  // Customize home page by domain
  if (pathname === '/' || pathname === '/landing') {
    if (isTechnical) {
      response.headers.set('x-bizra-theme', 'technical');
    } else {
      response.headers.set('x-bizra-theme', 'seeker');
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/landing',
    '/onboarding/:path*',
    '/dashboard/:path*',
    '/knowledge/:path*',
  ],
};
