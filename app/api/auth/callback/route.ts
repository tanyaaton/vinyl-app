/**
 * Spotify OAuth Callback Handler
 * Handles the redirect from Spotify after user authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/spotify/auth';

function buildCookie(
  name: string,
  value: string,
  maxAgeSeconds: number
): string {
  const isProd = process.env.NODE_ENV === 'production';
  const attrs = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isProd) attrs.push('Secure');
  return attrs.join('; ');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const origin = request.nextUrl.origin;

  console.log('Callback received');
  console.log('Request origin:', origin);
  console.log('Code present:', !!code);
  console.log('Error present:', !!error);
  console.log('State present:', !!state);

  if (error) {
    console.error('Spotify authorization error:', error);
    return NextResponse.redirect(
      new URL(`/create?error=${encodeURIComponent(error)}`, origin)
    );
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/create?error=no_code', origin));
  }

  if (!state) {
    console.error('State parameter missing');
    return NextResponse.redirect(
      new URL('/create?error=missing_state', origin)
    );
  }

  const stateParts = state.split(':');
  const codeVerifier = stateParts[0];
  const testMode = stateParts[2] === 'test';

  if (!codeVerifier) {
    console.error('Code verifier not found in state parameter');
    return NextResponse.redirect(
      new URL('/create?error=missing_verifier', origin)
    );
  }

  try {
    const tokens = await exchangeCodeForToken(code, codeVerifier);

    console.log('Token exchange successful!');
    console.log(
      'Access token received:',
      tokens.access_token.substring(0, 10) + '...'
    );

    const expiresAt = Date.now() + tokens.expires_in * 1000;
    const redirectPath = testMode ? '/test-spotify?auth=success' : '/create?step=3';
    const response = NextResponse.redirect(new URL(redirectPath, origin));

    // Build Set-Cookie headers explicitly so they are always attached to the redirect response.
    response.headers.append(
      'Set-Cookie',
      buildCookie('spotify_access_token', tokens.access_token, tokens.expires_in)
    );

    if (tokens.refresh_token) {
      response.headers.append(
        'Set-Cookie',
        buildCookie(
          'spotify_refresh_token',
          tokens.refresh_token,
          60 * 60 * 24 * 30
        )
      );
    }

    response.headers.append(
      'Set-Cookie',
      buildCookie(
        'spotify_token_expires_at',
        expiresAt.toString(),
        tokens.expires_in
      )
    );

    console.log('Set-Cookie headers attached to redirect response');

    return response;
  } catch (error) {
    console.error('Token exchange error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'token_exchange_failed';
    return NextResponse.redirect(
      new URL(`/create?error=${encodeURIComponent(errorMessage)}`, origin)
    );
  }
}
