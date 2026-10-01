import type { PatternPiece } from './types'

export async function exportPatternPDF(pieces: PatternPiece[], garmentDescription?: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const pageH = 297
  const margin = 15
  const cols = 2
  const rows = 3
  const cellW = (pageW - margin * 2 - 10) / cols
  const cellH = (pageH - margin * 2 - 30) / rows

  // Title page
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(22)
  doc.setTextColor(15, 16, 18)
  doc.text('Atelier AI — Pattern Pieces', margin, margin + 12)

  if (garmentDescription) {
    doc.setFontSize(10)
    doc.setTextColor(143, 143, 143)
    doc.text(garmentDescription, margin, margin + 22)
  }

  doc.setFontSize(9)
  doc.setTextColor(143, 143, 143)
  doc.text(`Generated ${new Date().toLocaleDateString()} · ${pieces.length} pieces`, margin, margin + 30)

  // Draw pieces
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    const col = i % cols
    const row = Math.floor(i / cols) % rows

    if (i > 0 && col === 0 && row === 0) doc.addPage()

    const x = margin + col * (cellW + 10)
    const y = margin + 40 + row * (cellH + 8)

    // Border
    doc.setDrawColor(232, 221, 208)
    doc.setLineWidth(0.3)
    doc.rect(x, y, cellW, cellH)

    // Load SVG as image
    try {
      const svgBlob = await fetch(piece.svg_url).then(r => r.blob())
      const svgUrl = URL.createObjectURL(svgBlob)
      const img = await loadImage(svgUrl)
      doc.addImage(img, 'PNG', x + 4, y + 4, cellW - 8, cellH - 16)
      URL.revokeObjectURL(svgUrl)
    } catch {
      // If image fails, just show the label
    }

    // Piece name
    doc.setFontSize(8)
    doc.setTextColor(15, 16, 18)
    doc.setFont('helvetica', 'bold')
    doc.text(piece.name, x + cellW / 2, y + cellH - 5, { align: 'center' })

    if (piece.notes) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(143, 143, 143)
      doc.setFontSize(7)
      doc.text(piece.notes, x + cellW / 2, y + cellH - 1, { align: 'center' })
    }
  }

  doc.save(`atelier-patterns-${Date.now()}.pdf`)
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
