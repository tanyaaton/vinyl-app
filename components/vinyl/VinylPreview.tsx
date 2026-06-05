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
  const discOverlap = coverSize * 0.45 // How much the disc overlaps the cover
  const discLeftOffset = (discSize - coverSize) / 2 // Extra space needed on left for larger disc

  return (
    <div className="relative flex items-center overflow-visible" style={{ width: coverSize + discSize - discOverlap, height: discSize }}>
      {/* Album sleeve */}
      <div className="relative z-10" style={{ flexShrink: 0, marginTop: (discSize - coverSize) / 2, marginLeft: discLeftOffset }}>
        <VinylCover
          coverImageUrl={coverImageUrl}
          stickers={stickers}
          name={name}
          size={coverSize}
        />
      </div>

      {/* Vinyl disc — overlaps cover from right, brought to front */}
      <div
        className="absolute"
        style={{ left: coverSize + discLeftOffset - discOverlap, top: 0, zIndex: 20 }}
      >
        <VinylDisc name={name} playlistName={playlistName} size={discSize} />
      </div>
    </div>
  )
}
