/**
 * Spotify Token Refresh Handler
 * Refreshes expired access tokens using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/spotify/auth';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('spotify_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // Refresh the access token
    const tokens = await refreshAccessToken(refreshToken);

    // Create response with new tokens
    const response = NextResponse.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    });

    // Update cookies with new tokens
    response.cookies.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    // Update refresh token if a new one was provided
    if (tokens.refresh_token) {
      response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Update expiration time
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    response.cookies.set('spotify_token_expires_at', expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear invalid tokens
    const response = NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );
    
    response.cookies.delete('spotify_access_token');
    response.cookies.delete('spotify_refresh_token');
    response.cookies.delete('spotify_token_expires_at');
    
    return response;
  }
}

// Also support GET for convenience
export async function GET(request: NextRequest) {
  return POST(request);
}

// Made with Bob
