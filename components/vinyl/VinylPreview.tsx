/**
 * Final assembled vinyl: cover sleeve on left, disc overlapping from the right.
 * Used on Step 4 and the public share page.
 */
'use client'
import { useState } from 'react'
import VinylDisc from './VinylDisc'
import VinylCover from './VinylCover'
import type { StickerPlacement, CoverImageLayout, VinylColor, TrackTextColor } from '@/lib/types'

interface Props {
  name: string
  playlistName: string
  coverImageUrl?: string | null
  coverImageLayout?: CoverImageLayout
  trackTextColor?: TrackTextColor
  vinylColor?: VinylColor
  stickers?: StickerPlacement[]
  tracks?: string[]
  coverSize?: number
  interactive?: boolean
}

export default function VinylPreview({
  name,
  playlistName,
  coverImageUrl,
  coverImageLayout = 'full',
  trackTextColor = 'gray',
  vinylColor = 'default',
  stickers = [],
  tracks = [],
  coverSize = 300,
  interactive = false,
}: Props) {
  const discSize = coverSize * 1.05
  const discOverlap = coverSize * 0.45 // How much the disc overlaps the cover
  const discLeftOffset = (discSize - coverSize) / 2 // Extra space needed on left for larger disc

  // Track which element is on top: 'cover' or 'disc'
  const [topElement, setTopElement] = useState<'cover' | 'disc'>('disc')

  const coverZIndex = topElement === 'cover' ? 20 : 10
  const discZIndex = topElement === 'disc' ? 20 : 10

  return (
    <div className="relative flex items-center overflow-visible" style={{ width: coverSize + discSize - discOverlap, height: discSize }}>
      {/* Album sleeve */}
      <div
        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
        style={{ flexShrink: 0, marginTop: (discSize - coverSize) / 2, marginLeft: discLeftOffset, zIndex: coverZIndex }}
        onClick={interactive ? () => setTopElement('cover') : undefined}
      >
        <VinylCover
          coverImageUrl={coverImageUrl}
          coverImageLayout={coverImageLayout}
          trackTextColor={trackTextColor}
          stickers={stickers}
          name={name}
          tracks={tracks}
          size={coverSize}
        />
      </div>

      {/* Vinyl disc — overlaps cover from right */}
      <div
        className={`absolute ${interactive ? 'cursor-pointer' : ''}`}
        style={{ left: coverSize + discLeftOffset - discOverlap, top: 0, zIndex: discZIndex }}
        onClick={interactive ? () => setTopElement('disc') : undefined}
      >
        <VinylDisc name={name} playlistName={playlistName} size={discSize} vinylColor={vinylColor} />
      </div>
    </div>
  )
}
