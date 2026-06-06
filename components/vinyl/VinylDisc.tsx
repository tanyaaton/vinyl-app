import type { VinylColor } from '@/lib/types'

/**
 * VinylDisc — two modes:
 *   landing=true  → vinyl-landing.png (arc texts + "Vinyl" script already baked in, no overlay)
 *   landing=false → vinyl base PNG (color-dependent) + SVG overlay for user name + playlist name
 */
interface Props {
  name?: string
  playlistName?: string
  size?: number
  landing?: boolean
  vinylColor?: VinylColor
  className?: string
}

// Per-color base PNG + SVG text fill. RGB values for non-default colors come
// from the user's brief: red 153,5,5 / pink 92,10,31 / blue 242,241,240.
export const VINYL_COLOR_STYLE: Record<VinylColor, { base: string; text: string }> = {
  default: { base: '/vinyl-base.png',      text: '#7B1818' },
  red:     { base: '/vinyl-base-red.png',  text: '#790404' },
  pink:    { base: '/vinyl-base-pink.png', text: '#181718' },
  blue:    { base: '/vinyl-base-blue.png', text: '#eae2d9' },
}

export default function VinylDisc({ name = '', playlistName = '', size = 448, landing = false, vinylColor = 'default', className = '' }: Props) {
  if (landing) {
    return (
      <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
        <img
          src="/vinyl-landing.png"
          alt="Vinyl record"
          className="w-full h-full"
          draggable={false}
        />
      </div>
    )
  }

  const { base, text } = VINYL_COLOR_STYLE[vinylColor]

  // Step pages — base vinyl + SVG name/playlist overlay
  // Label occupies roughly the inner 54% of the image diameter, centred
  const labelSize = size * 0.54
  const labelOffset = (size - labelSize) / 2
  const cx = size / 2
  // "by name" sits ~30% from top of the label area (above the STEREO bar)
  const nameY = labelOffset + labelSize * 0.20
  // Playlist name sits ~44% from top of label area
  const playlistY = labelOffset + labelSize * 0.4

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={base}
        alt="Vinyl record"
        className="w-full h-full"
        draggable={false}
      />

      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        {name && (
          <text
            x={cx}
            y={nameY}
            textAnchor="middle"
            fontFamily="'Jacquarda', cursive"
            fontSize={labelSize * 0.052}
            fill={text}
          >
            by {name}
          </text>
        )}
        {playlistName && (
          <text
            x={cx}
            y={playlistY}
            textAnchor="middle"
            fontFamily="'MrsSheppards', cursive"
            fontSize={labelSize * 0.22}
            fill={text}
          >
            {playlistName}
          </text>
        )}
      </svg>
    </div>
  )
}
