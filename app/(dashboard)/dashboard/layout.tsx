// app/(dashboard)/dashboard/layout.tsx
'use client'
import { LocaleProvider } from '@/lib/locale-context'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="student" />
        <div className="md:ml-64">
          {children}
        </div>
      </div>
    </LocaleProvider>
  )
}