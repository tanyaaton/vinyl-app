/**
 * Token Retrieval API Route
 * Retrieves access token from HTTP-only cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('Token endpoint called');
    const cookieStore = cookies();
    
    // Log all cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log('All cookies:', allCookies.map(c => c.name));
    
    const accessToken = cookieStore.get('spotify_access_token')?.value;
    const refreshToken = cookieStore.get('spotify_refresh_token')?.value;
    const expiresAt = cookieStore.get('spotify_token_expires_at')?.value;

    console.log('Access token found:', !!accessToken);
    console.log('Refresh token found:', !!refreshToken);
    console.log('Expires at found:', !!expiresAt);

    if (!accessToken) {
      console.log('No access token in cookies, returning 401');
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    console.log('Returning tokens to client');
    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt ? parseInt(expiresAt) : null,
    });
  } catch (error) {
    console.error('Error retrieving token:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve token' },
      { status: 500 }
    );
  }
}

// Made with Bob