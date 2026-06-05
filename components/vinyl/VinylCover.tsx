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
  lips: '/stickers/lips.png',
  moon: '/stickers/moon.png',
  bluestamp: '/stickers/bluestamp.png',
  tulips: '/stickers/tulips.png',
}

const CORNER_STYLES: Record<string, React.CSSProperties> = {
  'top-left':     { top: 40, left: 40 },
  'top-right':    { top: 50, right: 40 },
  'bottom-left':  { bottom: 40, left: 40 },
  'bottom-right': { bottom: 20, right: 60 },
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
        <div
          className="absolute overflow-hidden"
          style={{
            top: size * 0.072,
            left: size * 0.087,
            width: size * 0.825,
            height: size * 0.862,
          }}
        >
          <img
            src={coverImageUrl}
            alt="Vinyl cover"
            className="w-full h-full object-cover"
            style={{ opacity: 0.65 }}
          />
        </div>
      )}

      {/* Stickers */}
      {stickers.map(({ stickerId, corner, x, y, rotation }) => {
        // Use random position if available, otherwise fall back to corner positioning
        const useRandomPosition = x !== undefined && y !== undefined
        const positionStyle = useRandomPosition
          ? {
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation || 0}deg)`,
            }
          : {
              ...CORNER_STYLES[corner],
              transform: `rotate(${rotation || 0}deg)`,
            }
        
        return (
          <div
            key={stickerId}
            className="absolute"
            style={{
              ...positionStyle,
              width: size * 0.25,
              height: size * 0.25
            }}
          >
            <img
              src={STICKER_IMAGES[stickerId]}
              alt={stickerId}
              className="w-full h-full object-contain"
            />
          </div>
        )
      })}

      {/* Name label at bottom-left, inside the cover with margin */}
      {name && (
        <div
          className="absolute"
          style={{
            bottom: size * 0.072 + size * 0.03,  // Cover bottom inset + small margin
            left: size * 0.087 + size * 0.03,    // Cover left inset + small margin
          }}
        >
          <span
            className="font-jacquarda text-gray-700"
            style={{
              fontSize: size * 0.04,
              opacity: 0.6
            }}
          >
            by {name}
          </span>
        </div>
      )}
    </div>
  )
}
