import type { StickerPlacement } from '@/lib/types'

interface Props {
  coverImageUrl?: string | null
  stickers?: StickerPlacement[]
  name?: string
  size?: number
}

const STICKER_IMAGES: Record<string, string> = {
  stars: '/stickers/stars.png',
  stamp: '/stickers/stamp.png',
  psilove: '/stickers/psilove.png',
  bow: '/stickers/bow.png',
}

const CORNER_STYLES: Record<string, React.CSSProperties> = {
  'top-left':     { top: 8, left: 8 },
  'top-right':    { top: 8, right: 8 },
  'bottom-left':  { bottom: 8, left: 8 },
  'bottom-right': { bottom: 8, right: 8 },
}

export default function VinylCover({ coverImageUrl, stickers = [], name = '', size = 320 }: Props) {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Layer 0: real sleeve base PNG */}
      <img
        src="/vinyl-cover-base.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Layer 1: user cover image at 65% opacity */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Vinyl cover"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.65 }}
        />
      )}

      {/* Stickers */}
      {stickers.map(({ stickerId, corner }) => (
        <div
          key={stickerId}
          className="absolute"
          style={{ ...CORNER_STYLES[corner], width: size * 0.25, height: size * 0.25 }}
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
          <span className="font-jacquarda text-gray-700" style={{ fontSize: size * 0.055 }}>
            by {name}
          </span>
        </div>
      )}
    </div>
  )
}
