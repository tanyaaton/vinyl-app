/**
 * VinylDisc — two modes:
 *   landing=true  → vinyl-landing.png (arc texts + "Vinyl" script already baked in, no overlay)
 *   landing=false → vinyl-base.png   + SVG overlay for user name + playlist name
 */
interface Props {
  name?: string
  playlistName?: string
  size?: number
  landing?: boolean
}

export default function VinylDisc({ name = '', playlistName = '', size = 448, landing = false }: Props) {
  if (landing) {
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <img
          src="/vinyl-landing.png"
          alt="Vinyl record"
          className="w-full h-full"
          draggable={false}
        />
      </div>
    )
  }

  // Step pages — base vinyl + SVG name/playlist overlay
  // Label occupies roughly the inner 54% of the image diameter, centred
  const labelSize = size * 0.54
  const labelOffset = (size - labelSize) / 2
  const cx = size / 2
  // "by name" sits ~30% from top of the label area (above the STEREO bar)
  const nameY = labelOffset + labelSize * 0.30
  // Playlist name sits ~44% from top of label area
  const playlistY = labelOffset + labelSize * 0.44

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
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
        {name && (
          <text
            x={cx}
            y={nameY}
            textAnchor="middle"
            fontFamily="'Jacquarda', cursive"
            fontSize={labelSize * 0.09}
            fill="#7B1818"
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
            fill="#7B1818"
          >
            {playlistName}
          </text>
        )}
      </svg>
    </div>
  )
}
