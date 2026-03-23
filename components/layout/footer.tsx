'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { BookOpen, Instagram, Facebook, Send } from 'lucide-react'

export function Footer() {
  const { t, locale } = useLocale()
  const [content, setContent] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data || {}))
      .catch(() => {})
  }, [])

  const getValue = (key: string): string => {
    const value = content[`${key}.${locale}`]
    if (value !== undefined && value !== null) return value
    return content[`${key}.en`] || ''
  }

  const facebook = getValue('contact.facebook') || ''
  const instagram = getValue('contact.instagram') || ''
  const telegram = getValue('contact.telegram') || ''

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12" suppressHydrationWarning>
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">ARTAMONOVA</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium private English lessons tailored to your goals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.programs}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.booking}
                </Link>
              </li>
              <li>
                <Link href="/placement-test" className="text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.placementTest}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.blog}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Connect</h3>
            <div className="flex gap-4">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {telegram && (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Telegram"
                >
                  <Send className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Alexandra Artamonova. {t.footer.copyright}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
