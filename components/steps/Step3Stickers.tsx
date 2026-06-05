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
]

export default function Step3Stickers({ onBack, onNext }: Props) {
  const { coverImagePreviewUrl, stickers, name, toggleSticker } = useVinylStore()
  const placedIds = new Set(stickers.map((s) => s.stickerId))

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-jacquarda text-xl text-gray-700 mb-6 tracking-wider">Decorate your vinyl case</h2>

      <VinylCover coverImageUrl={coverImagePreviewUrl} stickers={stickers} name={name} size={320} />

      {/* Sticker picker */}
      <div className="flex gap-6 mt-8 items-end">
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
              style={{ width: 80, height: 80 }}
            >
              <img
                src={`/stickers/${id}.svg`}
                alt={label}
                className="w-full h-full object-contain"
              />
            </button>
          )
        })}
      </div>

      <p className="font-courier text-xs text-gray-400 mt-3">
        {stickers.length < 4
          ? `${stickers.length}/4 stickers placed — click to add or remove`
          : 'All corners filled — click a sticker to remove it'}
      </p>

      <div className="flex gap-8 mt-10">
        <button className="btn-tape text-lg px-10 py-3" onClick={onBack}>Back</button>
        <button className="btn-tape text-lg px-10 py-3" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
