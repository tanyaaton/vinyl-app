'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useVinylStore } from '@/lib/vinylStore'
import {
  AuthRequiredError,
  ensureMatchingOrigin,
  initiateSpotifyAuth,
} from '@/lib/spotify/auth'
import {
  SpotifyAPIError,
  getAllUserPlaylists,
  getUserProfile,
  getVinylTrackList,
  searchPlaylists,
} from '@/lib/spotify/api'
import type { SpotifyPlaylist } from '@/lib/types'

interface Props {
  onBack: () => void
  onNext: () => void
}

type Status =
  | 'idle'
  | 'checking'
  | 'loading-playlists'
  | 'ready'
  | 'continuing'
  | 'error'

export default function SpotifyConnect({ onBack, onNext }: Props) {
  const searchParams = useSearchParams()
  const justAuthed = searchParams.get('auth') === 'success'

  const {
    name,
    spotifyUser,
    selectedPlaylist,
    setName,
    setPlaylistName,
    setSpotifyUser,
    setSelectedPlaylist,
    setTracks,
  } = useVinylStore()

  const truncate8 = (s: string) => (s.length > 8 ? s.slice(0, 8) : s)

  // Default to 'idle' (show the Connect button) so the login step is always
  // explicit. The only time we skip 'idle' is when the OAuth callback redirected
  // back with ?auth=success — then auto-load profile + playlists.
  const [status, setStatus] = useState<Status>(justAuthed ? 'checking' : 'idle')
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [pendingSelection, setPendingSelection] = useState<SpotifyPlaylist | null>(null)
  const [query, setQuery] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const callbackError = searchParams.get('error')

  useEffect(() => {
    if (selectedPlaylist && !pendingSelection) setPendingSelection(selectedPlaylist)
  }, [selectedPlaylist, pendingSelection])

  async function loadProfileAndPlaylists() {
    setErrorMessage(null)
    setStatus('checking')
    try {
      const profile = await getUserProfile()
      setSpotifyUser(profile)
      setStatus('loading-playlists')
      const items = await getAllUserPlaylists()
      setPlaylists(items)
      setStatus('ready')
    } catch (err) {
      if (
        err instanceof AuthRequiredError ||
        (err instanceof SpotifyAPIError && err.status === 401)
      ) {
        // No valid session — kick off OAuth. The browser will navigate away.
        try {
          await initiateSpotifyAuth(false)
        } catch (authErr) {
          setErrorMessage(
            authErr instanceof Error ? authErr.message : 'Failed to start Spotify login'
          )
          setStatus('error')
        }
        return
      }
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load Spotify data')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (ensureMatchingOrigin()) return
    if (justAuthed) loadProfileAndPlaylists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () => searchPlaylists(playlists, query),
    [playlists, query]
  )

  function handleConnect() {
    loadProfileAndPlaylists()
  }

  async function handleContinue() {
    if (!pendingSelection) return
    setStatus('continuing')
    setErrorMessage(null)
    try {
      // If the picked playlist changed since last time, refresh the album
      // prefill so Step 2 reflects the new pick (don't overwrite if the user
      // re-confirmed the same playlist — they may have edited the album field).
      const playlistChanged = pendingSelection.id !== selectedPlaylist?.id
      setSelectedPlaylist(pendingSelection)
      if (playlistChanged) {
        setPlaylistName(truncate8(pendingSelection.name))
      }
      if (spotifyUser?.display_name && !name) {
        setName(spotifyUser.display_name)
      }
      const formatted = await getVinylTrackList(pendingSelection.id)
      setTracks(formatted)
      onNext()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load tracks')
      setStatus('ready')
    }
  }

  const showGridArea =
    status === 'loading-playlists' || status === 'ready' || status === 'continuing'

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h2 className="font-jacquarda text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 tracking-wider">
        Pick your playlist
      </h2>

      {callbackError && status === 'idle' && (
        <p className="font-jacquarda text-sm text-red-700 mb-3 text-center max-w-sm">
          {callbackError === 'access_denied'
            ? 'You declined Spotify access. Connect again to continue.'
            : `Spotify error: ${callbackError}`}
        </p>
      )}

      {status === 'idle' && (
        <div className="flex flex-col items-center gap-4 my-8">
          <SpotifyLogo className="w-12 h-12 sm:w-16 sm:h-16" />
          <p className="font-courier text-sm sm:text-base text-gray-600 text-center max-w-sm leading-relaxed">
            Connect your Spotify account to pick a playlist for your vinyl.
          </p>
          <button
            className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3"
            onClick={handleConnect}
          >
            Log in with Spotify
          </button>
        </div>
      )}

      {status === 'checking' && (
        <p className="font-jacquarda text-base text-gray-500 my-12">
          Checking Spotify…
        </p>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 my-8">
          <p className="font-jacquarda text-base text-red-700 text-center max-w-sm">
            {errorMessage ?? 'Something went wrong.'}
          </p>
          <button
            className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3"
            onClick={loadProfileAndPlaylists}
          >
            Retry
          </button>
        </div>
      )}

      {showGridArea && (
        <>
          {spotifyUser && (
            <p className="font-jacquarda text-sm text-gray-500 mb-3">
              hi, {spotifyUser.display_name}
            </p>
          )}

          <input
            className="vinyl-input max-w-sm mb-4"
            placeholder="search playlists"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {status === 'loading-playlists' ? (
            <PlaylistSkeleton />
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center gap-2 my-8">
              <p className="font-jacquarda text-base text-gray-600 text-center max-w-sm">
                You don&apos;t have any playlists yet.
              </p>
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-jacquarda text-base text-gray-500 underline hover:text-gray-800"
              >
                Create one on Spotify
              </a>
            </div>
          ) : (
            <div className="w-full max-h-[420px] sm:max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
                {filtered.map((p) => (
                  <PlaylistCard
                    key={p.id}
                    playlist={p}
                    selected={pendingSelection?.id === p.id}
                    disabled={status === 'continuing'}
                    onSelect={() => setPendingSelection(p)}
                  />
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full text-center font-jacquarda text-sm text-gray-500 py-6">
                    No playlists match &quot;{query}&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {pendingSelection && pendingSelection.tracks.total === 0 && (
            <p className="font-jacquarda text-sm text-amber-700 mt-3">
              This playlist has no tracks. Pick another one.
            </p>
          )}

          {errorMessage && (
            <p className="font-jacquarda text-sm text-red-700 mt-3">{errorMessage}</p>
          )}
        </>
      )}

      <div className="flex gap-4 sm:gap-8 mt-8 sm:mt-12">
        <button
          className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3"
          onClick={onBack}
        >
          Back
        </button>
        {status !== 'idle' && (
          <button
            className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3 disabled:opacity-40"
            onClick={handleContinue}
            disabled={
              !pendingSelection ||
              pendingSelection.tracks.total === 0 ||
              status === 'continuing' ||
              status === 'loading-playlists' ||
              status === 'checking' ||
              status === 'error'
            }
          >
            {status === 'continuing' ? 'Loading…' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}

function PlaylistCard({
  playlist,
  selected,
  disabled,
  onSelect,
}: {
  playlist: SpotifyPlaylist
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const coverUrl = playlist.images[0]?.url ?? null
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex flex-col items-start text-left p-2 transition-all border-2 ${
        selected
          ? 'border-gray-800 bg-white/60'
          : 'border-transparent hover:border-gray-400 bg-white/30'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="w-full aspect-square mb-2 bg-gray-200 overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-jacquarda text-3xl text-gray-400">
            {playlist.name.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      <p className="font-jacquarda text-sm text-gray-800 line-clamp-1 w-full">
        {playlist.name}
      </p>
      <p className="font-jacquarda text-xs text-gray-500 line-clamp-1 w-full">
        {playlist.tracks.total} tracks · {playlist.owner.display_name}
      </p>
    </button>
  )
}

function SpotifyLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 168 168"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <path
        fill="#1ED760"
        d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738zm38.404 120.78a5.217 5.217 0 0 1-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 0 1-6.249-3.93 5.213 5.213 0 0 1 3.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35-1.04-3.453.907-7.093 4.354-8.143 30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219-1.254-4.14 1.08-8.513 5.221-9.771 29.581-8.98 78.756-7.245 109.83 11.202 3.722 2.207 4.929 7.012 2.722 10.733-2.2 3.722-7.02 4.949-10.73 2.739z"
      />
    </svg>
  )
}

function PlaylistSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 p-2">
          <div className="w-full aspect-square bg-gray-200 animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-200 animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
