'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useVinylStore } from '@/lib/vinylStore'
import { saveVinyl } from '@/lib/vinylService'
import VinylPreview from '@/components/vinyl/VinylPreview'

type SaveState = 'saving' | 'done' | 'error'

export default function Step4Final() {
  const router = useRouter()
  const store = useVinylStore()
  const [shareUrl, setShareUrl] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('saving')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const hasSaved = useRef(false)

  useEffect(() => {
    if (hasSaved.current) return
    hasSaved.current = true

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Save timed out')), 15_000)
    )

    async function save() {
      try {
        const id = await Promise.race([
          saveVinyl({
            name: store.name,
            playlistName: store.playlistName,
            coverImageFile: store.coverImageFile,
            stickers: store.stickers,
            tracks: store.tracks,
            spotifyPlaylistId: store.selectedPlaylist?.id ?? null,
            spotifyPlaylistUrl:
              store.selectedPlaylist?.external_urls?.spotify ??
              (store.selectedPlaylist
                ? `https://open.spotify.com/playlist/${store.selectedPlaylist.id}`
                : null),
            spotifyUserId: store.spotifyUser?.id ?? null,
          }),
          timeout,
        ])
        store.setVinylId(id)
        setShareUrl(`${window.location.origin}/vinyl/${id}`)
        setSaveState('done')
      } catch (e) {
        console.error('Save failed:', e)
        setSaveError(e instanceof Error ? e.message : String(e))
        setSaveState('error')
      }
    }

    save()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStartOver() {
    store.reset()
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h2 className="font-jacquarda text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 tracking-wider">
        {"Here's your vinyl"}
      </h2>

      {/* Vinyl preview — always visible */}
      <div className="w-full flex justify-center overflow-visible">
        <div className="sm:hidden">
          <VinylPreview
            name={store.name}
            playlistName={store.playlistName}
            coverImageUrl={store.coverImagePreviewUrl}
            stickers={store.stickers}
            tracks={store.tracks}
            coverSize={240}
            interactive={true}
          />
        </div>
        <div className="hidden sm:block">
          <VinylPreview
            name={store.name}
            playlistName={store.playlistName}
            coverImageUrl={store.coverImagePreviewUrl}
            stickers={store.stickers}
            tracks={store.tracks}
            coverSize={380}
            interactive={true}
          />
        </div>
      </div>

      {/* Save status row */}
      <div className="mt-6 sm:mt-10 flex flex-col items-center gap-3 w-full max-w-lg">
        {saveState === 'saving' && (
          <p className="font-jacquarda text-sm text-gray-400 animate-pulse">
            saving your vinyl…
          </p>
        )}

        {saveState === 'error' && (
          <div className="flex flex-col items-center gap-2 max-w-md">
            <p className="font-jacquarda text-sm text-red-700 text-center">
              Could not save your vinyl.
            </p>
            {saveError && (
              <p className="font-courier text-xs text-amber-700 text-center break-all">
                {saveError}
              </p>
            )}
          </div>
        )}

        {saveState === 'done' && shareUrl && (
          <div className="flex flex-col items-stretch gap-3 w-full">
            {store.selectedPlaylist && (
              <a
                href={
                  store.selectedPlaylist.external_urls?.spotify ??
                  `https://open.spotify.com/playlist/${store.selectedPlaylist.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tape px-4 sm:px-5 py-2 text-sm sm:text-base self-center"
              >
                ♫ open in spotify
              </a>
            )}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full">
              <span className="font-jacquarda text-base sm:text-xl text-gray-600 sm:whitespace-nowrap">
                Share this vinyl
              </span>
              <input readOnly value={shareUrl} className="vinyl-input flex-1 text-xs sm:text-sm" />
              <button className="btn-tape px-4 sm:px-5 py-2 text-sm sm:text-base" onClick={handleCopy}>
                {copied ? 'copied!' : 'copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        className="font-jacquarda text-base text-gray-400 hover:text-gray-700 mt-8 transition-colors"
        onClick={handleStartOver}
      >
        ↩ start over
      </button>
    </div>
  )
}
