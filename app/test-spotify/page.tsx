'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { initiateSpotifyAuth, getValidAccessToken, ensureMatchingOrigin } from '@/lib/spotify/auth';
import { getUserProfile, getAllUserPlaylists } from '@/lib/spotify/api';
import type { SpotifyUser, SpotifyPlaylist } from '@/lib/types';

export default function TestSpotifyPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Make sure this tab is on the same origin as the Spotify redirect URI.
  // If not, bounce to it before doing anything else — otherwise cookies set
  // by the OAuth callback won't be visible to /api/auth/token from this tab.
  useEffect(() => {
    ensureMatchingOrigin();
  }, []);

  // Check if we just returned from successful auth and auto-fetch data
  useEffect(() => {
    const autoFetchAfterAuth = async () => {
      if (searchParams.get('auth') === 'success') {
        setAuthSuccess(true);
        setLoading(true);
        setError(null);
        
        try {
          const token = await getValidAccessToken();
          if (!token) {
            setError('No access token found after authentication');
            setLoading(false);
            return;
          }
          
          // Fetch profile
          const profile = await getUserProfile();
          setUser(profile);
          
          // Fetch playlists
          const userPlaylists = await getAllUserPlaylists();
          setPlaylists(userPlaylists);
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data after authentication');
        } finally {
          setLoading(false);
        }
      }
    };
    
    autoFetchAfterAuth();
  }, [searchParams]);

  const handleLogin = () => {
    try {
      initiateSpotifyAuth(true); // Pass true to enable test mode
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
    }
  };

  const handleFetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError('No access token found. Please login first.');
        return;
      }
      const profile = await getUserProfile();
      setUser(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError('No access token found. Please login first.');
        return;
      }
      const userPlaylists = await getAllUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Spotify Integration Test Page
        </h1>

        {/* Success Message */}
        {authSuccess && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-white font-semibold">✓ Authentication successful!</p>
            <p className="text-white/90 text-sm mt-1">You can now test the API functions below.</p>
          </div>
        )}

        {/* Login Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Step 1: Authenticate with Spotify
          </h2>
          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Login with Spotify
          </button>
          <p className="text-white/70 text-sm mt-2">
            This will redirect you to Spotify to authorize the app
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Step 2: Fetch Your Profile
          </h2>
          <button
            onClick={handleFetchProfile}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Profile'}
          </button>
          
          {user && (
            <div className="mt-4 p-4 bg-white/20 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Profile Data:</h3>
              <div className="text-white">
                <p><strong>Name:</strong> {user.display_name}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>ID:</strong> {user.id}</p>
                {user.images && user.images[0] && (
                  <img 
                    src={user.images[0].url} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full mt-2"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Playlists Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Step 3: Fetch Your Playlists
          </h2>
          <button
            onClick={handleFetchPlaylists}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Playlists'}
          </button>
          
          {playlists.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                Your Playlists ({playlists.length}):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.map((playlist) => (
                  <div 
                    key={playlist.id}
                    className="p-4 bg-white/20 rounded-lg flex items-center gap-4"
                  >
                    {playlist.images[0] && (
                      <img 
                        src={playlist.images[0].url} 
                        alt={playlist.name}
                        className="w-16 h-16 rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">{playlist.name}</p>
                      <p className="text-white/70 text-sm">
                        {playlist.tracks.total} tracks
                      </p>
                      <p className="text-white/70 text-sm">
                        by {playlist.owner.display_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-white font-semibold">Error:</p>
            <p className="text-white/90">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Testing Instructions
          </h2>
          <ol className="text-white/90 space-y-2 list-decimal list-inside">
            <li>Click "Login with Spotify" - you'll be redirected to Spotify</li>
            <li>Authorize the app on Spotify's page</li>
            <li>You'll be redirected back to this page (or to /create?step=3)</li>
            <li>Click "Get Profile" to test fetching your Spotify profile</li>
            <li>Click "Get Playlists" to test fetching your playlists</li>
            <li>Check the browser console (F12) for detailed logs</li>
            <li>Check sessionStorage for stored tokens</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
            <p className="text-white font-semibold">⚠️ Note:</p>
            <p className="text-white/90 text-sm">
              After clicking "Login with Spotify", you may be redirected to /create?step=3 
              instead of back to this page. That's expected behavior from the callback handler. 
              You can navigate back to /test-spotify to continue testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
