// components/layout/dashboard-sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  BookOpen, Home, Calendar, FileText, BarChart3, History,
  FolderOpen, Settings, Users, DollarSign, LogOut, Award,
  Newspaper, ClipboardList, Edit3, Star, HelpCircle, Menu,
  GraduationCap, LayoutDashboard, Palette, Clock, TrendingUp,
} from 'lucide-react'

// NOUA structură pentru student dashboard (mai clară)
const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lessons', label: 'My Lessons', icon: Calendar },
  { href: '/dashboard/homework', label: 'Homework', icon: FileText },
  { href: '/dashboard/materials', label: 'Materials', icon: FolderOpen },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/history', label: 'History', icon: Clock },
  { href: '/dashboard/programs', label: 'Programs', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

// components/layout/dashboard-sidebar.tsx
// În array-ul adminLinks, adaugă după Programs:

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/programs', label: 'Programs', icon: BookOpen },
  { href: '/admin/homework-submissions', label: 'Homework Submissions', icon: FileText }, // NOU
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/content', label: 'Content', icon: Palette },
  { href: '/admin/earnings', label: 'Finance', icon: DollarSign },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ type, onNavigate }: { type: 'student' | 'admin'; onNavigate?: () => void }) {
  const pathname = usePathname()
  const links = type === 'student' ? studentLinks : adminLinks

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <BookOpen className="h-6 w-6 text-sidebar-primary" />
        <span className="font-serif text-lg font-semibold text-sidebar-foreground">ARTAMONOVA</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href ||
            (link.href !== '/admin' && link.href !== '/dashboard' && pathname.startsWith(link.href))
          return (
            <Link key={link.href} href={link.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}>
              <Icon className="h-4 w-4" />{link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link href="/" onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
          <BookOpen className="h-4 w-4" />Back to Website
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" />Log Out
        </button>
      </div>
    </div>
  )
}

export function DashboardSidebar({ type }: { type: 'student' | 'admin' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarContent type={type} />
      </aside>

      {/* Mobile hamburger */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-background shadow-md">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent type={type} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}