'use client'
import { useEffect } from 'react'
import { useVinylStore } from '@/lib/vinylStore'
import VinylDisc from '@/components/vinyl/VinylDisc'

interface Props {
  onBack: () => void
  onNext: () => void
}

const truncate8 = (s: string) => (s.length > 8 ? s.slice(0, 8) : s)

export default function Step1Form({ onBack, onNext }: Props) {
  const {
    name,
    playlistName,
    spotifyUser,
    selectedPlaylist,
    setName,
    setPlaylistName,
  } = useVinylStore()

  // Pre-fill from Spotify on first visit. Only fills empty fields so user edits
  // are never overwritten on remount.
  useEffect(() => {
    if (spotifyUser && !name) setName(spotifyUser.display_name)
    if (selectedPlaylist && !playlistName) setPlaylistName(truncate8(selectedPlaylist.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="font-jacquarda text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 tracking-wider">Your vinyl detail</h2>

      <div className="w-full flex justify-center px-4">
        <VinylDisc name={name} playlistName={playlistName} size={280} className="sm:hidden" />
        <VinylDisc name={name} playlistName={playlistName} size={448} className="hidden sm:block" />
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col gap-4 w-full max-w-sm px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="font-jacquarda text-sm sm:text-base text-gray-600 sm:whitespace-nowrap sm:w-36 sm:text-right sm:shrink-0">
            your name :
          </label>
          <input
            className="vinyl-input flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            maxLength={20}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="font-jacquarda text-sm sm:text-base text-gray-600 sm:whitespace-nowrap sm:w-36 sm:text-right sm:shrink-0">
            playlist name :
          </label>
          <input
            className="vinyl-input flex-1"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="playlist name"
            maxLength={20}
          />
        </div>
      </div>

      <div className="flex gap-4 sm:gap-8 mt-8 sm:mt-12">
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onBack}>Back</button>
        <button
          className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3 disabled:opacity-40"
          onClick={onNext}
          disabled={!name.trim() || !playlistName.trim()}
        >
          Next
        </button>
      </div>
    </div>
  )
}
