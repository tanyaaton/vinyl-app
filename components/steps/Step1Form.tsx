'use client'
import { useVinylStore } from '@/lib/vinylStore'
import VinylDisc from '@/components/vinyl/VinylDisc'

interface Props {
  onBack: () => void
  onNext: () => void
}

export default function Step1Form({ onBack, onNext }: Props) {
  const { name, playlistName, setName, setPlaylistName } = useVinylStore()

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-jacquarda text-xl text-gray-700 mb-6 tracking-wider">Your vinyl detail</h2>

      <VinylDisc name={name} playlistName={playlistName} size={280} />

      <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
        <div className="flex items-center gap-4">
          <label className="font-jacquarda text-base text-gray-600 whitespace-nowrap w-36 text-right shrink-0">
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
        <div className="flex items-center gap-4">
          <label className="font-jacquarda text-base text-gray-600 whitespace-nowrap w-36 text-right shrink-0">
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

      <div className="flex gap-8 mt-12">
        <button className="btn-tape text-lg px-10 py-3" onClick={onBack}>Back</button>
        <button
          className="btn-tape text-lg px-10 py-3 disabled:opacity-40"
          onClick={onNext}
          disabled={!name.trim() || !playlistName.trim()}
        >
          Next
        </button>
      </div>
    </div>
  )
}
