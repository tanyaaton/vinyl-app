'use client'
import { useVinylStore } from '@/lib/vinylStore'
import VinylCover from '@/components/vinyl/VinylCover'
import type { StickerId } from '@/lib/types'

interface Props {
  onBack: () => void
  onNext: () => void
}

const STICKERS: { id: StickerId; label: string }[] = [
  { id: 'stars', label: 'Stars' },
  { id: 'stamp', label: 'Stamp' },
  { id: 'psilove', label: 'P.S.' },
  { id: 'bow', label: 'Bow' },
  { id: 'lips', label: 'Lips' },
  { id: 'moon', label: 'Moon' },
  { id: 'bluestamp', label: 'Blue Stamp' },
  { id: 'tulips', label: 'Tulips' },
]

export default function Step3Stickers({ onBack, onNext }: Props) {
  const { coverImagePreviewUrl, stickers, name, toggleSticker, tracks } = useVinylStore()
  const placedIds = new Set(stickers.map((s) => s.stickerId))

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h2 className="font-jacquarda text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 tracking-wider">Decorate your vinyl case</h2>

      <div className="w-full flex justify-center">
        <div className="sm:hidden">
          <VinylCover coverImageUrl={coverImagePreviewUrl} stickers={stickers} name={name} tracks={tracks} size={280} />
        </div>
        <div className="hidden sm:block">
          <VinylCover coverImageUrl={coverImagePreviewUrl} stickers={stickers} name={name} tracks={tracks} size={420} />
        </div>
      </div>

      {/* Sticker picker */}
      <div className="grid grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8 max-w-xs sm:max-w-md">
        {STICKERS.map(({ id, label }) => {
          const active = placedIds.has(id)
          return (
            <button
              key={id}
              onClick={() => toggleSticker(id)}
              title={label}
              className={`relative p-1 rounded transition-all ${
                active ? 'ring-2 ring-offset-1 ring-kraft-dark scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ width: 60, height: 60 }}
            >
              <img
                src={`/stickers/${id}.png`}
                alt={label}
                className="w-full h-full object-contain"
              />
            </button>
          )
        })}
      </div>

      <p className="font-courier text-xs text-gray-400 mt-3 text-center">
        {stickers.length < 4
          ? `${stickers.length}/4 stickers placed — click to add or remove`
          : 'All corners filled — click a sticker to remove it'}
      </p>

      <div className="flex gap-4 sm:gap-8 mt-8 sm:mt-10">
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onBack}>Back</button>
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
