// app/(dashboard)/admin/layout.tsx
'use client'
import { LocaleProvider } from '@/lib/locale-context'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="admin" />
        <div className="md:ml-64">
          {children}
        </div>
      </div>
    </LocaleProvider>
  )
}