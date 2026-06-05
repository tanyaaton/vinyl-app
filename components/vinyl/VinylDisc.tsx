/**
 * CSS-rendered vinyl disc. Replace outer div background with vinyl-disc.png
 * once exported from Figma — keep the label overlay as-is.
 */
interface Props {
  name?: string
  playlistName?: string
  size?: number
}

export default function VinylDisc({ name = '', playlistName = '', size = 320 }: Props) {
  const s = size
  const labelSize = s * 0.45
  const labelOffset = (s - labelSize) / 2

  return (
    <div
      className="relative rounded-full shrink-0"
      style={{
        width: s,
        height: s,
        background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 60%, #111 75%, #0a0a0a 100%)',
        boxShadow: `0 ${s * 0.03}px ${s * 0.1}px rgba(0,0,0,0.6), inset 0 0 ${s * 0.05}px rgba(255,255,255,0.04)`,
      }}
    >
      {/* Groove rings */}
      {[0.25, 0.33, 0.41, 0.48, 0.55, 0.62, 0.7, 0.77, 0.84, 0.9, 0.95].map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-gray-700/30"
          style={{
            width: s * r,
            height: s * r,
            top: (s - s * r) / 2,
            left: (s - s * r) / 2,
          }}
        />
      ))}

      {/* Yellow label */}
      <div
        className="absolute rounded-full overflow-hidden flex flex-col items-center justify-center"
        style={{
          width: labelSize,
          height: labelSize,
          top: labelOffset,
          left: labelOffset,
          backgroundColor: '#F5C518',
        }}
      >
        {/* Curved top text */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 100 100"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <path id="topArc" d="M 15,50 A 35,35 0 0,1 85,50" />
            <path id="bottomArc" d="M 18,62 A 32,32 0 0,0 82,62" />
          </defs>
          <text fill="#7B1818" fontSize="6" fontFamily="'Courier New', monospace">
            <textPath href="#topArc" startOffset="50%" textAnchor="middle">
              share your music with vinyl
            </textPath>
          </text>
          <text fill="#7B1818" fontSize="5.5" fontFamily="'Courier New', monospace">
            <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
              created with love by @tanyaaton
            </textPath>
          </text>
        </svg>

        {/* Name ("by …") */}
        {name && (
          <p
            className="font-script text-vinyl-label-text text-center leading-none mb-0.5 relative z-10"
            style={{ fontSize: labelSize * 0.1 }}
          >
            by {name}
          </p>
        )}

        {/* Playlist name — big script */}
        <p
          className="font-script font-bold text-vinyl-label-text text-center leading-none relative z-10"
          style={{ fontSize: playlistName ? labelSize * 0.18 : labelSize * 0.22 }}
        >
          {playlistName || 'Vinyl'}
        </p>

        {/* STEREO / 45 RPM bar */}
        <div
          className="flex items-center gap-1 relative z-10 mt-1"
          style={{ fontSize: labelSize * 0.07 }}
        >
          <span className="font-mono text-vinyl-label-text tracking-widest uppercase">STEREO</span>
          <div
            className="rounded-full bg-vinyl-label-text"
            style={{ width: labelSize * 0.07, height: labelSize * 0.07 }}
          />
          <span className="font-mono text-vinyl-label-text tracking-widest uppercase">45 RPM</span>
        </div>

        {/* MUSIC RECORD / SIDE A */}
        <div className="text-center relative z-10 mt-0.5">
          <p
            className="font-mono text-vinyl-label-text tracking-widest uppercase font-bold leading-none"
            style={{ fontSize: labelSize * 0.075 }}
          >
            MUSIC RECORD
          </p>
          <p
            className="font-mono text-vinyl-label-text tracking-widest uppercase leading-none"
            style={{ fontSize: labelSize * 0.065 }}
          >
            SIDE A
          </p>
        </div>
      </div>

      {/* Center hole */}
      <div
        className="absolute rounded-full bg-gray-900"
        style={{
          width: s * 0.04,
          height: s * 0.04,
          top: s * 0.48,
          left: s * 0.48,
        }}
      />
    </div>
  )
}
