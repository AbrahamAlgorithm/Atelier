'use client'

import { useState } from 'react'
import { createProject } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, CheckCircle2 } from 'lucide-react'

interface SaveProjectModalProps {
  jobId: string
  defaultName: string
  thumbnailUrl?: string
  onClose: () => void
}

export function SaveProjectModal({ jobId, defaultName, thumbnailUrl, onClose }: SaveProjectModalProps) {
  const [name, setName] = useState(defaultName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await createProject(jobId, name.trim(), thumbnailUrl)
      setSaved(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError('Failed to save project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-white rounded-[10px] p-6 w-full max-w-sm shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {saved ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 size={32} className="text-green-500" />
            <p className="text-[14px] font-[400] tracking-[-0.02em] text-[#0f1012]">Saved to projects!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[350] tracking-[-0.36px] text-[#0f1012]">Save Project</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-[#f2f2f4] rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                id="project-name"
                label="Project name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My dress pattern..."
                required
              />
              {error && <p className="text-[12px] text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" loading={saving} className="flex-1">Save</Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
