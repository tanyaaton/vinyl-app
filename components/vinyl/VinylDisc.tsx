import type { VinylColor } from '@/lib/types'

/**
 * VinylDisc — two modes:
 *   landing=true  → vinyl-base.png + SVG overlay with "Vinylio" center text and arc texts
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
    // Landing page — vinyl-base.png + SVG text overlays
    const labelSize = size * 0.54
    const cx = size / 2
    const cy = size / 2
    const arcRadius = labelSize * 0.42
    
    return (
      <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
        <img
          src="/vinyl-base.png"
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
          {/* Center text: "Vinylio" */}
          <text
            x={cx}
            y={cy - labelSize * 0.076}
            textAnchor="middle"
            fontFamily="'MrsSheppards', cursive"
            fontSize={labelSize * 0.335}
            fill="#7B1818"
          >
            Vinylio
          </text>
          
          {/* Subtitle text: "made with you by @tanyaaton" with hyperlink */}
          <text
            x={cx}
            y={cy + labelSize * 0.092}
            textAnchor="middle"
            fontFamily="'Jacquarda', cursive"
            fontSize={labelSize * 0.045}
            fill="#7B1818"
          >
            made with love by{' '}
            <a href="https://instagram.com/tanyaaton/" target="_blank" rel="noopener noreferrer">
              <tspan style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                @tanyaaton
              </tspan>
            </a>
          </text>
          
          {/* Top arc text: "share your music with vinyl" */}
          {/* <defs>
            <path
              id="topArc"
              d={`M ${cx - arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx + arcRadius} ${cy}`}
            />
          </defs> */}
          <text
            fontFamily="'Jacquarda', cursive"
            fontSize={labelSize * 0.065}
            fill="#7B1818"
          >
            <textPath href="#topArc" startOffset="50%" textAnchor="middle">
              share your music with vinyl
            </textPath>
          </text>
          
          {/* Bottom arc text: "create with love by @tanyaaton" */}
          {/* <defs>
            <path
              id="bottomArc"
              d={`M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx - arcRadius} ${cy}`}
            />
          </defs> */}
          <text
            fontFamily="'Jacquarda', cursive"
            fontSize={labelSize * 0.065}
            fill="#7B1818"
          >
            <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
              create with love by @tanyaaton
            </textPath>
          </text>
        </svg>
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
