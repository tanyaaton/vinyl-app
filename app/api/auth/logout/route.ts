/**
 * Spotify Logout Handler
 * Clears the three HTTP-only auth cookies so the next request to /api/auth/token returns 401.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function expiredCookie(name: string): string {
  const attrs = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export async function POST(_request: NextRequest) {
  const response = NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  response.headers.append('Set-Cookie', expiredCookie('spotify_access_token'));
  response.headers.append('Set-Cookie', expiredCookie('spotify_refresh_token'));
  response.headers.append('Set-Cookie', expiredCookie('spotify_token_expires_at'));
  return response;
}
