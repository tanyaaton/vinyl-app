/**
 * Final assembled vinyl: cover sleeve on left, disc overlapping from the right.
 * Used on Step 4 and the public share page.
 */
import VinylDisc from './VinylDisc'
import VinylCover from './VinylCover'
import type { StickerPlacement } from '@/lib/types'

interface Props {
  name: string
  playlistName: string
  coverImageUrl?: string | null
  stickers?: StickerPlacement[]
  coverSize?: number
}

export default function VinylPreview({
  name,
  playlistName,
  coverImageUrl,
  stickers = [],
  coverSize = 300,
}: Props) {
  const discSize = coverSize * 1.05

  return (
    <div className="relative flex items-center" style={{ width: coverSize + discSize * 0.55, height: coverSize }}>
      {/* Album sleeve */}
      <div className="relative z-10" style={{ flexShrink: 0 }}>
        <VinylCover
          coverImageUrl={coverImageUrl}
          stickers={stickers}
          name={name}
          size={coverSize}
        />
      </div>

      {/* Vinyl disc — overlaps cover from right */}
      <div
        className="absolute"
        style={{ left: coverSize * 0.55, top: (coverSize - discSize) / 2, zIndex: 5 }}
      >
        <VinylDisc name={name} playlistName={playlistName} size={discSize} />
      </div>
    </div>
  )
}
