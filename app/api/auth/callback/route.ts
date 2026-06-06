/**
 * Spotify OAuth Callback Handler
 * Handles the redirect from Spotify after user authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken } from '@/lib/spotify/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  console.log('Callback received');
  console.log('Code present:', !!code);
  console.log('Error present:', !!error);
  console.log('State present:', !!state);

  // Handle authorization errors
  if (error) {
    console.error('Spotify authorization error:', error);
    return NextResponse.redirect(
      new URL(`/create?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate authorization code
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(
      new URL('/create?error=no_code', request.url)
    );
  }

  try {
    console.log('Attempting to exchange code for token...');
    console.log('Code received:', code.substring(0, 10) + '...');
    
    // Extract code verifier from state parameter
    // State format: verifier:random_state or verifier:random_state:test
    if (!state) {
      console.error('State parameter missing');
      return NextResponse.redirect(
        new URL('/create?error=missing_state', request.url)
      );
    }
    
    const stateParts = state.split(':');
    const codeVerifier = stateParts[0];
    const randomState = stateParts[1];
    const testMode = stateParts[2] === 'test';
    
    console.log('Code verifier from state:', codeVerifier ? 'Found' : 'Not found');
    console.log('Random state:', randomState ? 'Found' : 'Not found');
    console.log('Test mode:', testMode);
    
    if (!codeVerifier) {
      console.error('Code verifier not found in state parameter');
      return NextResponse.redirect(
        new URL('/create?error=missing_verifier', request.url)
      );
    }
    
    // Exchange authorization code for access token
    const tokens = await exchangeCodeForToken(code, codeVerifier);
    
    console.log('Token exchange successful!');
    console.log('Access token received:', tokens.access_token.substring(0, 10) + '...');

    // Calculate expiration time
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    
    // Create redirect response
    const redirectUrl = testMode ? '/test-spotify?auth=success' : '/create?step=3';
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Set cookies on the response object (this is the correct way in Next.js App Router)
    response.cookies.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in,
    });

    if (tokens.refresh_token) {
      response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    response.cookies.set('spotify_token_expires_at', expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in,
    });

    console.log('Cookies set on response object');
    
    return response;
  } catch (error) {
    console.error('Token exchange error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    const errorMessage = error instanceof Error ? error.message : 'token_exchange_failed';
    return NextResponse.redirect(
      new URL(`/create?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

// Made with Bob
