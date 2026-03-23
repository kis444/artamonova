'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { BookOpen, Globe, User, LogOut, Settings } from 'lucide-react'
import { NotificationBell } from '@/components/layout/notification-bell'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardHeaderProps {
  title: string
}

const localeLabels: Record<string, string> = { en: '🇬🇧 EN', ro: '🇷🇴 RO', ru: '🇷🇺 RU' }

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const { locale, setLocale } = useLocale()
  const isAdmin = (session?.user as any)?.role === 'admin'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        <Link href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <BookOpen className="h-4 w-4" />
          Back to site
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="font-serif text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationBell />

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <Globe className="h-4 w-4" />
              {locale.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(['en', 'ro', 'ru'] as const).map(l => (
              <DropdownMenuItem key={l} onClick={() => setLocale(l)} className={locale === l ? 'font-bold' : ''}>
                {localeLabels[l]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="font-medium text-sm">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={isAdmin ? '/admin/settings' : '/dashboard/settings'}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}