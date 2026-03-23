'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Globe, BookOpen, Sun, Moon, LogIn, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const { locale, setLocale, t } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/about', label: t.nav.about },
    { href: '/programs', label: t.nav.programs },
    { href: '/blog', label: t.nav.blog },
    { href: '/contact', label: t.nav.contact },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const dashboardHref =
    session?.user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4" suppressHydrationWarning>
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold text-foreground">ARTAMONOVA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Toggle */}
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                suppressHydrationWarning
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" suppressHydrationWarning>
              <DropdownMenuItem onClick={() => setLocale('en')}>
                <span className={locale === 'en' ? 'font-semibold' : ''}>🇬🇧 English</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('ro')}>
                <span className={locale === 'ro' ? 'font-semibold' : ''}>🇷🇴 Română</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('ru')}>
                <span className={locale === 'ru' ? 'font-semibold' : ''}>🇷🇺 Русский</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu - SINGURUL dropdown pentru user */}
          {status === 'loading' ? null : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  suppressHydrationWarning
                >
                  <User className="h-4 w-4" />
                  {session.user?.name?.split(' ')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" suppressHydrationWarning>
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t.nav.myDashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                {t.nav.login}
              </Link>
            </Button>
          )}

          <Button asChild>
            <Link href="/booking">{t.nav.booking}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              {session ? (
                <>
                  <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                    <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      {t.nav.myDashboard}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                    suppressHydrationWarning
                  >
                    <LogOut className="h-4 w-4" />
                    {t.nav.logout}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    {t.nav.login}
                  </Link>
                </Button>
              )}

              <div className="flex items-center gap-2">
                {mounted && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleTheme} 
                    className="flex-1"
                    suppressHydrationWarning
                  >
                    {theme === 'dark' ? <><Sun className="mr-2 h-4 w-4" />Light</> : <><Moon className="mr-2 h-4 w-4" />Dark</>}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      suppressHydrationWarning
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'EN' : locale === 'ro' ? 'RO' : 'RU'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent suppressHydrationWarning>
                    <DropdownMenuItem onClick={() => setLocale('en')}>🇬🇧 English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocale('ro')}>🇷🇴 Română</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocale('ru')}>🇷🇺 Русский</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button asChild className="w-full">
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  {t.nav.booking}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}