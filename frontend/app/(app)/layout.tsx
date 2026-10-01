import { AuthGuard } from '@/components/layout/AuthGuard'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardPrefetcher } from '@/components/layout/DashboardPrefetcher'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardPrefetcher />
      <div className="flex min-h-screen bg-[#faf9f5]">
        <Sidebar />
        {/* pt-13 = mobile top bar height; pb-16 = mobile bottom nav height */}
        <main className="flex-1 overflow-auto pt-13 pb-16 md:pt-0 md:pb-0">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
