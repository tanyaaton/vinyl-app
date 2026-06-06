import type { StickerPlacement, CoverImageLayout } from '@/lib/types'

interface Props {
  coverImageUrl?: string | null
  coverImageLayout?: CoverImageLayout
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

export default function VinylCover({ coverImageUrl, coverImageLayout = 'full', stickers = [], name = '', tracks = [], size = 320 }: Props) {
  const imageBoxStyle: React.CSSProperties =
    coverImageLayout === 'top-right'
      ? {
          // Top-right badge, anchored with the same margin the base sleeve PNG
          // uses for its front panel (~7% top, ~8.7% right).
          top: size * 0.072,
          right: size * 0.087,
          width: size * 0.35,
          height: size * 0.35,
        }
      : {
          // Full bleed: image is exactly the size and position of the base cover.
          top: 0,
          left: 0,
          width: size,
          height: size,
        }

  // Filter out the empty/padded slots getVinylTrackList emits so the rendered
  // tracklist is consecutive (no large gaps from blank lines). Side A gets the
  // ceiling half so an odd count puts the extra song on Side A.
  const realTracks = tracks.filter((t) => t && t.trim() !== '')
  const sideACount = Math.ceil(realTracks.length / 2)
  const sideA = realTracks.slice(0, sideACount)
  const sideB = realTracks.slice(sideACount)

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

      {/* Layer 1: user cover image (semi-transparent so the paper base shows through) */}
      {coverImageUrl && (
        <div className="absolute overflow-hidden" style={imageBoxStyle}>
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

      {/*
        Track list at bottom-left. Anchored to `bottom` so the last rendered
        line always sits at the same bottom margin regardless of how many
        tracks there are.
      */}
      {realTracks.length > 0 && (
        <div
          className="absolute"
          style={{
            bottom: size * 0.05,
            left: size * 0.05,
            maxWidth: size * 0.825 - size * 0.06,
            maxHeight: size * 0.45,
          }}
        >
          <div
            className="text-gray-700"
            style={{
              fontFamily: 'Jacquarda, cursive',
              fontSize: size * 0.0255,
              opacity: 0.7,
              lineHeight: '1.15',
            }}
          >
            <div className="font-semibold" style={{ marginBottom: size * 0.005 }}>Side A</div>
            {sideA.map((track, i) => (
              <div key={`a-${i}`} className="truncate">{track}</div>
            ))}
            {sideB.length > 0 && (
              <>
                <div className="font-semibold" style={{ marginTop: size * 0.01, marginBottom: size * 0.005 }}>Side B</div>
                {sideB.map((track, i) => (
                  <div key={`b-${i}`} className="truncate">{track}</div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
