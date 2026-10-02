// A blazer pattern sheet: cut lines (traced in on scroll via `.draw`), seam
// allowances, grain lines, notches, a title block and a scale bar.

const ink = '#0f1012'
const seam = '#8B6914'
const paper = '#fffdf7'
const sans = 'ui-sans-serif, system-ui, sans-serif'

interface PieceProps {
  d: string
  x: number
  y: number
  /** centre the seam-allowance line is scaled around */
  c: [number, number]
  label: string
  cut: string
  labelAt: [number, number]
  grain?: [number, number, number]
  notches?: string
}

function Piece({ d, x, y, c, label, cut, labelAt, grain, notches }: PieceProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="draw" pathLength={1} d={d} fill={paper} stroke={ink} strokeWidth="1.1" strokeLinejoin="round" />
      <path
        d={d}
        transform={`translate(${c[0]} ${c[1]}) scale(0.9) translate(${-c[0]} ${-c[1]})`}
        stroke={seam}
        strokeWidth="0.8"
        strokeDasharray="2.5 2"
      />
      {grain && (
        <g stroke={ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${grain[0]} ${grain[1]}V${grain[2]}`} />
          <path d={`M${grain[0] - 2.5} ${grain[1] + 4}L${grain[0]} ${grain[1]}L${grain[0] + 2.5} ${grain[1] + 4}`} />
          <path d={`M${grain[0] - 2.5} ${grain[2] - 4}L${grain[0]} ${grain[2]}L${grain[0] + 2.5} ${grain[2] - 4}`} />
        </g>
      )}
      {notches && <path d={notches} stroke={ink} strokeWidth="0.9" strokeLinecap="round" />}
      <g fill={ink} fontFamily={sans} textAnchor="middle">
        <text x={labelAt[0]} y={labelAt[1]} fontSize="6.4" letterSpacing="0.7" fillOpacity="0.7">
          {label}
        </text>
        <text x={labelAt[0]} y={labelAt[1] + 8} fontSize="5" letterSpacing="0.5" fillOpacity="0.45">
          {cut}
        </text>
      </g>
    </g>
  )
}

export function BlazerPattern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" aria-hidden="true" className={className}>
      <defs>
        <pattern id="pattern-grid-minor" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" stroke={ink} strokeOpacity="0.05" strokeWidth="0.5" />
        </pattern>
        <pattern id="pattern-grid-major" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" stroke={ink} strokeOpacity="0.09" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#pattern-grid-minor)" />
      <rect width="400" height="300" fill="url(#pattern-grid-major)" />

      <Piece
        d="M22 0L62 10C56 26 56 46 70 58L66 168L2 172L0 82L-14 26L-6 22Z"
        x={30} y={22} c={[30, 90]}
        label="FRONT" cut="CUT 2" labelAt={[34, 70]}
        grain={[34, 84, 150]}
        notches="M58 38L63 36M64 108H70M40 150L44 104L48 150"
      />
      <Piece
        d="M0 4C8 6 16 4 20 0L58 8C52 24 52 44 62 54L60 166L2 168L4 100Z"
        x={112} y={22} c={[30, 88]}
        label="BACK" cut="CUT 2" labelAt={[30, 70]}
        grain={[30, 84, 150]}
        notches="M50 34L55 32M51 39L56 37"
      />
      <Piece
        d="M10 0L28 6L20 84L22 168L2 170L0 84L-12 28L-4 24Z"
        x={198} y={22} c={[8, 90]}
        label="FACING" cut="CUT 2" labelAt={[9, 112]}
        grain={[9, 128, 158]}
      />
      <Piece
        d="M0 46C6 18 30 0 48 0C66 0 86 18 92 44L84 170L12 172Z"
        x={238} y={20} c={[46, 92]}
        label="UPPER SLEEVE" cut="CUT 2" labelAt={[46, 62]}
        grain={[46, 78, 150]}
        notches="M48 -3V3M4 30L9 32"
      />
      <Piece
        d="M0 30C10 22 30 22 44 30L48 150L6 152Z"
        x={340} y={26} c={[24, 90]}
        label="UNDER" cut="SLEEVE · 2" labelAt={[24, 62]}
        grain={[24, 80, 140]}
      />
      <Piece
        d="M0 14C20 2 70 2 90 14L86 30C66 20 24 20 4 30Z"
        x={24} y={222} c={[45, 18]}
        label="COLLAR" cut="CUT 2" labelAt={[45, 20]}
      />
      <Piece
        d="M0 0H44V12Q44 16 40 16H4Q0 16 0 12Z"
        x={132} y={228} c={[22, 8]}
        label="FLAP" cut="CUT 4" labelAt={[22, 7]}
      />

      {/* Scale bar */}
      <g stroke={ink} strokeOpacity="0.6" strokeWidth="0.8">
        <path d="M24 274H74M24 270V278M49 272V276M74 270V278" />
      </g>
      <g fill={ink} fillOpacity="0.5" fontFamily={sans} fontSize="5.5" letterSpacing="0.4">
        <text x="24" y="288">0</text>
        <text x="66" y="288">10 CM</text>
      </g>

      {/* Title block */}
      <g transform="translate(240 214)">
        <rect width="146" height="72" rx="3" fill={paper} stroke={ink} strokeOpacity="0.5" strokeWidth="0.8" />
        <path d="M0 26H146M0 50H146M73 50V72" stroke={ink} strokeOpacity="0.25" strokeWidth="0.6" />
        <g fill={ink} fontFamily={sans}>
          <text x="10" y="17" fontSize="9" letterSpacing="1.6" fillOpacity="0.85">ATELIER</text>
          <text x="10" y="41" fontSize="7" letterSpacing="0.8" fillOpacity="0.7">RASPBERRY BLAZER</text>
          <text x="10" y="64" fontSize="5.5" letterSpacing="0.5" fillOpacity="0.5">SIZE 38</text>
          <text x="83" y="64" fontSize="5.5" letterSpacing="0.5" fillOpacity="0.5">7 PIECES · 1:10</text>
        </g>
      </g>
    </svg>
  )
}
