/**
 * Vinyl disc composite:
 *   Layer 0 – vinyl-grooves.png  (full black disc, white center hole)
 *   Layer 1 – vinyl-label.png    (yellow label with STEREO / MUSIC RECORD baked in)
 *   Layer 2 – dynamic text       (user's name + playlist name, upper half of label)
 *
 * To swap assets: replace files in /public/ — no code change needed.
 */
interface Props {
  name?: string
  playlistName?: string
  size?: number
}

export default function VinylDisc({ name = '', playlistName = '', size = 448 }: Props) {
  // Label at 1.05 — slightly overlaps the inner groove ring edge
  const labelSize = size * 1
  const labelOffset = (size - labelSize) / 2 

  const labelCentreX = size / 2
  const nameY = labelOffset + labelSize * 0.35
  const playlistY = labelOffset + labelSize * 0.45

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Layer 0: groove ring */}
      {/* Dark base fills the white gaps in the groove ring PNG center */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: '#111111' }}
      />

      <img
        src="/vinyl-grooves.png"
        alt=""
        className="absolute inset-0 w-full h-full"
        draggable={false}
      />

      {/* Layer 1: yellow label centered */}
      <img
        src="/vinyl-label.png"
        alt=""
        className="absolute"
        style={{
          width: labelSize,
          height: labelSize,
          top: labelOffset,
          left: labelOffset,
        }}
        draggable={false}
      />

      {/* Layer 2: dynamic text overlay */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        {name && (
          <text
            x={labelCentreX}
            y={nameY}
            textAnchor="middle"
            fontFamily="'Jacquarda', cursive"
            fontSize={labelSize * 0.03}
            fill="#7B1818"
          >
            by {name}
          </text>
        )}
        {playlistName && (
          <text
            x={labelCentreX}
            y={playlistY}
            textAnchor="middle"
            fontFamily="'MrsSheppards', cursive"
            fontSize={labelSize * 0.12}
            fill="#7B1818"
          >
            {playlistName}
          </text>
        )}
      </svg>
    </div>
  )
}
