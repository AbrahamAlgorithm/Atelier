// Technical flat sketch of the double-breasted blazer from the hero — the
// "design" a designer starts from in the Preview stage.

const ink = '#0f1012'
const body = '#f2a0b6'
const lapel = '#f7bccd'
const inside = '#c95a78'

const line = { stroke: ink, strokeWidth: 1.25, strokeLinejoin: 'round' as const, vectorEffect: 'non-scaling-stroke' as const }
const fine = { stroke: ink, strokeOpacity: 0.35, strokeWidth: 1, strokeDasharray: '3 2.5', fill: 'none', vectorEffect: 'non-scaling-stroke' as const }

export function BlazerFlat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 236" fill="none" aria-hidden="true" className={className}>
      {/* Sleeves sit behind the body edge */}
      <path d="M50 30C60 46 64 60 62 76L56 172L34 168L40 52Q42 36 50 30Z" fill={body} {...line} />
      <path d="M150 30C140 46 136 60 138 76L144 172L166 168L160 52Q158 36 150 30Z" fill={body} {...line} />

      {/* Body */}
      <path d="M84 18Q100 24 116 18L150 30C140 46 136 60 138 76L140 206L60 206L62 76C64 60 60 46 50 30Z" fill={body} {...line} />

      {/* Inside of the neck, then lapels */}
      <path d="M92 22L97 122H103L108 22Q100 26 92 22Z" fill={inside} {...line} />
      <path d="M86 18L72 44L76 48L68 52L97 122L92 22Z" fill={lapel} {...line} />
      <path d="M114 18L128 44L124 48L132 52L103 122L108 22Z" fill={lapel} {...line} />
      <path d="M74 54L95 112M126 54L105 112" {...fine} />

      {/* Front edge, darts, pockets, buttons */}
      <path d="M100 122V206" {...line} />
      <path d="M79 100L81 158M121 100L119 158" {...fine} />
      <path d="M66 168L90 166V173L66 175Z" fill={lapel} {...line} />
      <path d="M134 168L110 166V173L134 175Z" fill={lapel} {...line} />
      <path d="M114 88L130 86V90L114 92Z" fill={lapel} {...line} />
      <path d="M62 200H138" {...fine} />
      {[[90, 134], [110, 134], [90, 152], [110, 152]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" fill={ink} />
      ))}
      {[[41, 158], [42, 152], [159, 158], [158, 152]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" fill={ink} fillOpacity="0.6" />
      ))}

      {/* Measurement annotations */}
      <g stroke={ink} strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <path d="M184 18V206M180 18H188M180 206H188" />
        <path d="M60 222H140M60 218V226M140 218V226" />
      </g>
      <g fill={ink} fillOpacity="0.55" fontSize="7" letterSpacing="0.5" fontFamily="ui-sans-serif, system-ui, sans-serif">
        <text x="190" y="116" transform="rotate(90 190 116)" textAnchor="middle">LENGTH 72</text>
        <text x="100" y="234" textAnchor="middle">CHEST 52</text>
      </g>
    </svg>
  )
}
