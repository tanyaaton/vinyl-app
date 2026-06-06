import type { StickerPlacement } from '@/lib/types'

interface Props {
  coverImageUrl?: string | null
  stickers?: StickerPlacement[]
  name?: string
  tracks?: string[]
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

export default function VinylCover({ coverImageUrl, stickers = [], name = '', tracks = [], size = 320 }: Props) {
  return (
    <div
      className="relative shrink-0 overflow-hidden shadow-md"
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
              width: size * 0.25 * 1.2,
              height: size * 0.25 * 1.2
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

      {/* Track list at bottom-left, inside the cover with margin */}
      {tracks.length > 0 && (
        <div
          className="absolute"
          style={{
            bottom: size * 0.05,  // More space from bottom to fit all tracks
            left: size * 0.02 + size * 0.03,    // Align with cover left edge + margin
            maxWidth: size * 0.825 - size * 0.06, // Stay within cover bounds with margin
            maxHeight: size * 0.45,  // Increased height for all 12 tracks + labels
          }}
        >
          <div
            className="text-gray-700"
            style={{
              fontFamily: 'Jacquarda, cursive',
              fontSize: size * 0.0255,  // Smaller font to fit all tracks
              opacity: 0.7,
              lineHeight: '1.15'  // Tighter line height to fit all tracks
            }}
          >
            <div className="font-semibold" style={{ marginBottom: size * 0.005 }}>Side A</div>
            {tracks.slice(0, 6).map((track, i) => (
              <div key={`a-${i}`} className="truncate">{track || ' '}</div>
            ))}
            <div className="font-semibold" style={{ marginTop: size * 0.01, marginBottom: size * 0.005 }}>Side B</div>
            {tracks.slice(6, 12).map((track, i) => (
              <div key={`b-${i}`} className="truncate">{track || ' '}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
