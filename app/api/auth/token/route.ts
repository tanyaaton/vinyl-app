/**
 * Token Retrieval API Route
 * Retrieves access token from HTTP-only cookies
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('Token endpoint called');
  console.log('Request origin:', request.nextUrl.origin);
  console.log(
    'Incoming cookies:',
    request.cookies.getAll().map(c => c.name)
  );

  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  const expiresAt = request.cookies.get('spotify_token_expires_at')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No access token found' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt ? parseInt(expiresAt) : null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
