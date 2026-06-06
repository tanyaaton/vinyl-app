/**
 * Spotify Authentication Service
 * Implements Authorization Code with PKCE flow for secure client-side authentication
 * Reference: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

/**
 * Thrown when no valid Spotify session exists (no access cookie, or refresh
 * failed). Callers should treat this as "user must log in" rather than
 * retrying — it isn't a transient network failure.
 */
export class AuthRequiredError extends Error {
  constructor(message: string = 'Spotify authentication required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

// Required scopes for the application
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

/**
 * Generate a random code verifier for PKCE
 * @returns Base64 URL-encoded random string
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from verifier using SHA-256
 * @param verifier - The code verifier
 * @returns Base64 URL-encoded SHA-256 hash
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64 URL encode without padding
 * @param buffer - Uint8Array to encode
 * @returns Base64 URL-encoded string
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Store PKCE verifier in sessionStorage
 * @param verifier - Code verifier to store
 */
function storeCodeVerifier(verifier: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('spotify_code_verifier', verifier);
  }
}

/**
 * Retrieve PKCE verifier from sessionStorage
 * @returns Stored code verifier or null
 */
function getCodeVerifier(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('spotify_code_verifier');
  }
  return null;
}

/**
 * Clear PKCE verifier from sessionStorage
 */
function clearCodeVerifier(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('spotify_code_verifier');
  }
}

/**
 * If the current page origin doesn't match the configured Spotify redirect URI's
 * origin (e.g. user is on http://localhost:3000 but the redirect URI is
 * http://127.0.0.1:3000), navigate to the matching origin first. Otherwise
 * cookies set during the OAuth callback won't be visible on subsequent fetches.
 *
 * Returns true if a redirect was triggered (caller should stop).
 */
export function ensureMatchingOrigin(): boolean {
  if (typeof window === 'undefined') return false;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  if (!redirectUri) return false;

  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(redirectUri).origin;
  } catch {
    return false;
  }

  if (window.location.origin === expectedOrigin) return false;

  const target = new URL(window.location.pathname + window.location.search + window.location.hash, expectedOrigin);
  window.location.replace(target.toString());
  return true;
}

/**
 * Initiate Spotify authentication flow
 * Redirects user to Spotify authorization page
 * @param testMode - If true, adds test=true to callback redirect
 */
export async function initiateSpotifyAuth(testMode: boolean = false): Promise<void> {
  // Bounce to the redirect URI's origin first if we aren't already on it.
  if (ensureMatchingOrigin()) return;

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Spotify credentials not configured. Check environment variables.');
  }

  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store verifier in sessionStorage for client-side access
  storeCodeVerifier(codeVerifier);
  
  // Encode verifier in state parameter so it can be passed to server-side callback
  // State format: verifier:random_state:test (test flag is optional)
  const randomState = generateCodeVerifier(); // Reuse function for random string
  const state = testMode ? `${codeVerifier}:${randomState}:test` : `${codeVerifier}:${randomState}`;

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state, // Include verifier in state parameter
  });

  // Redirect to Spotify authorization page
  window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param code - Authorization code from callback
 * @param codeVerifier - PKCE code verifier (optional, will try to get from sessionStorage if not provided)
 * @returns Token response with access_token and refresh_token
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier?: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  
  // Try to get verifier from parameter or sessionStorage
  const verifier = codeVerifier || getCodeVerifier();

  if (!clientId || !redirectUri) {
    throw new Error('Spotify credentials not configured');
  }

  if (!verifier) {
    throw new Error('Code verifier not found. Please restart authentication.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  // Clear the code verifier after successful exchange (only if running in browser)
  if (typeof window !== 'undefined') {
    clearCodeVerifier();
  }

  return data;
}

/**
 * Refresh an expired access token
 * @param refreshToken - The refresh token
 * @returns New token response
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  if (!clientId) {
    throw new Error('Spotify client ID not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  return await response.json();
}

/**
 * Get valid access token from HTTP-only cookies via API route
 * @returns Valid access token
 * @throws Error if unable to get valid token
 */
export async function getValidAccessToken(): Promise<string> {
  try {
    // Fetch token from server-side cookies via API route
    const response = await fetch('/api/auth/token', {
      credentials: 'include', // Include cookies in request
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthRequiredError('No Spotify session — please log in.');
      }
      throw new Error('Failed to retrieve access token');
    }

    const data = await response.json();

    // Check if token is expired or about to expire
    if (data.expires_at) {
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      const isExpired = Date.now() + bufferTime >= data.expires_at;

      if (isExpired && data.refresh_token) {
        // Token expired, refresh it via API route
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!refreshResponse.ok) {
          throw new AuthRequiredError('Spotify session expired — please log in.');
        }

        const refreshData = await refreshResponse.json();
        return refreshData.access_token;
      }
    }

    return data.access_token;
  } catch (error) {
    if (error instanceof AuthRequiredError) throw error;
    if (error instanceof Error) throw error;
    throw new Error('Failed to get valid access token');
  }
}

// Made with Bob
