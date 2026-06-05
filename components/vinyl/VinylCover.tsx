import Image from 'next/image'
import type { StickerPlacement } from '@/lib/types'

interface Props {
  coverImageUrl?: string | null
  stickers?: StickerPlacement[]
  name?: string
  size?: number
}

// Swap .svg → .png once real assets are exported from Figma
const STICKER_IMAGES: Record<string, string> = {
  stars: '/stickers/stars.svg',
  stamp: '/stickers/stamp.svg',
  psilove: '/stickers/psilove.svg',
  bow: '/stickers/bow.svg',
}

const CORNER_STYLES: Record<string, React.CSSProperties> = {
  'top-left': { top: 8, left: 8 },
  'top-right': { top: 8, right: 8 },
  'bottom-left': { bottom: 8, left: 8 },
  'bottom-right': { bottom: 8, right: 8 },
}

export default function VinylCover({ coverImageUrl, stickers = [], name = '', size = 320 }: Props) {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg, #e8e4df 0%, #d4cfc9 100%)',
        boxShadow: '2px 2px 12px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.4)',
      }}
    >
      {/* Cover image at 35% opacity */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Vinyl cover"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.65 }}
        />
      )}

      {/* Sleeve highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }}
      />

      {/* Stickers */}
      {stickers.map(({ stickerId, corner }) => (
        <div
          key={stickerId}
          className="absolute"
          style={{ ...CORNER_STYLES[corner], width: size * 0.22, height: size * 0.22 }}
        >
          <img
            src={STICKER_IMAGES[stickerId]}
            alt={stickerId}
            className="w-full h-full object-contain"
          />
        </div>
      ))}

      {/* Name label at bottom-left */}
      {name && (
        <div className="absolute bottom-2 left-3">
          <span
            className="font-jacquarda text-gray-700"
            style={{ fontSize: size * 0.055 }}
          >
            by {name}
          </span>
        </div>
      )}
    </div>
  )
}
