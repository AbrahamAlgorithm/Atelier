// Fetches a URL as a blob and triggers a browser download.
// Falls back to opening in a new tab if fetch fails (e.g. CORS edge cases).
export async function downloadBlob(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(url, '_blank')
  }
}

export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function jobTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ghost_mannequin: 'Ghost Mannequin',
    pattern_generator: 'Pattern Generator',
    virtual_tryon: 'Virtual Try-On',
  }
  return labels[type] || type
}
