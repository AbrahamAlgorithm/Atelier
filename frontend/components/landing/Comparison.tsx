import { Ghost, Repeat, Scissors, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SectionHeader } from './SectionHeader'

const rows = [
  { task: 'Client preview', tool: 'Virtual Try-On', icon: UserCircle2, tile: 'bg-[#f6d3ec]', bar: 'bg-[#e88cc0]', old: 'Weeks for a physical sample', atelier: 'About 90 seconds', width: '7%' },
  { task: 'Pattern draft', tool: 'Pattern Generator', icon: Scissors, tile: 'bg-[#cfeac6]', bar: 'bg-[#6fbf5f]', old: '1–3 days per design', atelier: 'About 45 seconds', width: '5%' },
  { task: 'Product shot', tool: 'Ghost Mannequin', icon: Ghost, tile: 'bg-[#dfe7f1]', bar: 'bg-[#7d9cc0]', old: '2–4 hours plus a photographer', atelier: 'About 60 seconds', width: '6%' },
  { task: 'Every revision', tool: 'All three tools', icon: Repeat, tile: 'bg-[#fbe38a]', bar: 'bg-[#d9b32e]', old: 'Days per round', atelier: 'Seconds per re-upload', width: '4%' },
]

export function Comparison() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="The difference"
          title="Weeks of production work, done in minutes."
          subtitle="What each step takes the traditional way, and what it takes with Atelier."
        />

        <div className="reveal mt-14 sm:mt-16 rounded-[32px] bg-white p-5 sm:p-10 ring-1 ring-[#0f1012]/6 shadow-[0_40px_80px_-60px_rgba(15,16,18,0.35)]">
          <div className="hidden md:grid grid-cols-[220px_1fr] gap-8 pb-5 text-[12px] font-[500] uppercase tracking-[0.12em] text-[#0f1012]/40">
            <span>Step</span>
            <span className="flex items-center gap-6">
              <span className="flex items-center gap-2"><span className="w-3 h-1.5 rounded-full bg-[#0f1012]/15" />The old way</span>
              <span className="flex items-center gap-2"><span className="w-3 h-1.5 rounded-full bg-[#0f1012]" />With Atelier</span>
            </span>
          </div>

          <ul className="divide-y divide-[#0f1012]/8 border-t border-[#0f1012]/8">
            {rows.map(({ task, tool, icon: Icon, tile, bar, old, atelier, width }) => (
              <li key={task} className="grid gap-4 py-6 md:grid-cols-[220px_1fr] md:gap-8 md:items-center">
                <div className="flex items-center gap-3">
                  <span className={cn('w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center', tile)}>
                    <Icon size={17} className="text-[#0f1012]" />
                  </span>
                  <div>
                    <p className="text-[15px] font-[500] tracking-[-0.02em] text-[#0f1012]">{task}</p>
                    <p className="text-[12.5px] tracking-[-0.01em] text-[#0f1012]/45">{tool}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="relative h-9">
                    <div className="grow-x absolute inset-0 rounded-full bg-[repeating-linear-gradient(135deg,rgba(15,16,18,0.07)_0_6px,rgba(15,16,18,0.04)_6px_12px)]" />
                    <span className="absolute inset-y-0 left-4 flex items-center text-[13px] tracking-[-0.01em] text-[#0f1012]/55">{old}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn('grow-x h-9 min-w-12 rounded-full', bar)} style={{ width }} />
                    <span className="text-[13.5px] font-[500] tracking-[-0.01em] text-[#0f1012]">{atelier}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
