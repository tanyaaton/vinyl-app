/**
 * Spotify API Service
 * Handles all Spotify Web API calls with error handling and rate limiting
 * Reference: https://developer.spotify.com/documentation/web-api
 */

import { getValidAccessToken } from './auth';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Spotify User Profile
 */
export interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  images?: Array<{ url: string; height?: number; width?: number }>;
  followers?: { total: number };
  country?: string;
}

/**
 * Spotify Playlist
 */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images: Array<{ url: string; height?: number; width?: number }>;
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
  collaborative: boolean;
  external_urls: {
    spotify: string;
  };
}

/**
 * Spotify Track
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
  };
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
}

/**
 * Spotify API Error
 */
export class SpotifyAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'SpotifyAPIError';
  }
}

/**
 * Make authenticated request to Spotify API with error handling and rate limiting
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Response data
 */
async function spotifyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle rate limiting (429)
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
    throw new SpotifyAPIError(
      'Rate limit exceeded. Please try again later.',
      429,
      retryAfter
    );
  }

  // Handle unauthorized (401)
  if (response.status === 401) {
    throw new SpotifyAPIError(
      'Authentication failed. Please log in again.',
      401
    );
  }

  // Handle other errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new SpotifyAPIError(
      error.error?.message || `API request failed with status ${response.status}`,
      response.status
    );
  }

  return await response.json();
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @returns Result of function
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof SpotifyAPIError && error.status === 401) {
        throw error;
      }

      // Handle rate limiting with Retry-After header
      if (error instanceof SpotifyAPIError && error.status === 429) {
        const delay = (error.retryAfter || 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Exponential backoff for other errors
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Get current user's profile
 * @returns User profile data
 */
export async function getUserProfile(): Promise<SpotifyUser> {
  return retryWithBackoff(() => spotifyFetch<SpotifyUser>('/me'));
}

/**
 * Get current user's playlists
 * @param limit - Number of playlists to return (max 50)
 * @param offset - Index of first playlist to return
 * @returns Array of playlists
 */
export async function getUserPlaylists(
  limit = 50,
  offset = 0
): Promise<SpotifyPlaylist[]> {
  const response = await retryWithBackoff(() =>
    spotifyFetch<{ items: SpotifyPlaylist[]; total: number }>(
      `/me/playlists?limit=${limit}&offset=${offset}`
    )
  );
  return response.items;
}

/**
 * Get all user's playlists (handles pagination)
 * @returns Array of all playlists
 */
export async function getAllUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const allPlaylists: SpotifyPlaylist[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const playlists = await getUserPlaylists(limit, offset);
    allPlaylists.push(...playlists);

    // If we got fewer playlists than the limit, we've reached the end
    if (playlists.length < limit) {
      break;
    }

    offset += limit;
  }

  return allPlaylists;
}

/**
 * Get tracks from a playlist
 * @param playlistId - Playlist ID
 * @param limit - Number of tracks to return (max 100)
 * @param offset - Index of first track to return
 * @returns Array of tracks
 */
export async function getPlaylistTracks(
  playlistId: string,
  limit = 100,
  offset = 0
): Promise<SpotifyTrack[]> {
  const response = await retryWithBackoff(() =>
    spotifyFetch<{
      items: Array<{ track: SpotifyTrack }>;
      total: number;
    }>(`/playlists/${playlistId}/items?limit=${limit}&offset=${offset}`)
  );

  // Filter out null tracks (can happen with local files or removed tracks)
  return response.items
    .map(item => item.track)
    .filter(track => track !== null);
}

/**
 * Get first N tracks from a playlist
 * @param playlistId - Playlist ID
 * @param count - Number of tracks to retrieve
 * @returns Array of tracks (up to count)
 */
export async function getFirstNTracks(
  playlistId: string,
  count: number
): Promise<SpotifyTrack[]> {
  const tracks = await getPlaylistTracks(playlistId, Math.min(count, 100), 0);
  return tracks.slice(0, count);
}

/**
 * Format track for display on vinyl cover
 * @param track - Spotify track
 * @returns Formatted string "Artist Name - Track Name"
 */
export function formatTrackForVinyl(track: SpotifyTrack): string {
  const artistNames = track.artists.map(artist => artist.name).join(', ');
  return `${artistNames} - ${track.name}`;
}

/**
 * Get formatted track list for vinyl (first 12 tracks)
 * @param playlistId - Playlist ID
 * @returns Array of formatted track strings (exactly 12, padded if needed)
 */
export async function getVinylTrackList(playlistId: string): Promise<string[]> {
  const tracks = await getFirstNTracks(playlistId, 12);
  const formattedTracks = tracks.map(formatTrackForVinyl);

  // Ensure exactly 12 tracks (pad with empty strings if needed)
  while (formattedTracks.length < 12) {
    formattedTracks.push('');
  }

  return formattedTracks.slice(0, 12);
}

/**
 * Search user's playlists by name
 * @param playlists - Array of playlists to search
 * @param query - Search query
 * @returns Filtered playlists
 */
export function searchPlaylists(
  playlists: SpotifyPlaylist[],
  query: string
): SpotifyPlaylist[] {
  if (!query.trim()) {
    return playlists;
  }

  const lowerQuery = query.toLowerCase();
  return playlists.filter(
    playlist =>
      playlist.name.toLowerCase().includes(lowerQuery) ||
      playlist.description?.toLowerCase().includes(lowerQuery) ||
      playlist.owner.display_name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get playlist details
 * @param playlistId - Playlist ID
 * @returns Playlist details
 */
export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  return retryWithBackoff(() =>
    spotifyFetch<SpotifyPlaylist>(`/playlists/${playlistId}`)
  );
}

// Made with Bob
