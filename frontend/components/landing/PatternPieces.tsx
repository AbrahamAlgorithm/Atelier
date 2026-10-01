// Illustrated sewing-pattern pieces (bodice front + sleeve) for the hero's Pattern Generator card.

const BODICE = 'M0 18C14 18 22 10 24 0L58 10C52 24 54 42 64 46L60 98Q30 104 0 102Z'
const SLEEVE = 'M0 30C8 10 22 0 32 0C42 0 56 10 64 30L56 92H8Z'

const paper = '#fffdf7'
const ink = '#0f1012'
const seam = '#8B6914'

function GrainLine({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g stroke={ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${x} ${y1}V${y2}`} />
      <path d={`M${x - 2.5} ${y1 + 3.5}L${x} ${y1}L${x + 2.5} ${y1 + 3.5}`} />
      <path d={`M${x - 2.5} ${y2 - 3.5}L${x} ${y2}L${x + 2.5} ${y2 - 3.5}`} />
    </g>
  )
}

export function PatternPieces({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 132" fill="none" aria-hidden="true" className={className}>
      {/* Sleeve — sits behind the bodice */}
      <g transform="translate(70 24) rotate(9 32 46)">
        <path d={SLEEVE} fill={paper} stroke={ink} strokeWidth="1.1" strokeLinejoin="round" />
        <path
          d={SLEEVE}
          transform="translate(32 50) scale(0.86) translate(-32 -50)"
          stroke={seam}
          strokeWidth="0.8"
          strokeDasharray="2.5 2"
        />
        <GrainLine x={32} y1={22} y2={78} />
        <path d="M32 -2.5V3M3.5 46.5L9.5 45.5M60.5 46.5L54.5 45.5" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />
        <text x="36" y="62" fill={ink} fillOpacity="0.55" fontSize="5.2" letterSpacing="0.6" fontFamily="ui-sans-serif, system-ui, sans-serif">
          SLEEVE
        </text>
      </g>

      {/* Bodice front */}
      <g transform="translate(8 16) rotate(-6 32 52)">
        <path d={BODICE} fill={paper} stroke={ink} strokeWidth="1.1" strokeLinejoin="round" />
        <path
          d={BODICE}
          transform="translate(30 52) scale(0.88) translate(-30 -52)"
          stroke={seam}
          strokeWidth="0.8"
          strokeDasharray="2.5 2"
        />
        {/* Waist dart */}
        <path d="M22 101L28 62L34 100" stroke={ink} strokeWidth="0.9" strokeLinejoin="round" />
        <GrainLine x={14} y1={30} y2={86} />
        {/* Notches */}
        <path d="M52.5 31.5L58 29.5M58.5 72H65" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />
        <text x="34" y="48" fill={ink} fillOpacity="0.55" fontSize="5.2" letterSpacing="0.6" fontFamily="ui-sans-serif, system-ui, sans-serif">
          FRONT
        </text>
        <text x="34" y="55" fill={ink} fillOpacity="0.4" fontSize="4.2" letterSpacing="0.4" fontFamily="ui-sans-serif, system-ui, sans-serif">
          CUT 2
        </text>
      </g>
    </svg>
  )
}
