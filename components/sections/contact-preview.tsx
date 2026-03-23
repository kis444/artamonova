'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Clock, ArrowRight } from 'lucide-react'

export function ContactPreview() {
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

  const email = getValue('contact.email') || 'sulifur1991@rambler.com'
  const address = getValue('contact.address') || 'Online lessons worldwide\nBased in Chisinau, Moldova'
  const hours = 'Monday - Friday, 9:00 - 18:00'

  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">
              Ready to Start Your English Journey?
            </h2>
            <p className="mb-6 text-lg opacity-90">
              Book your first lesson today or get in touch with any questions. I am here to help you achieve your language goals.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/booking">
                  {t.nav.booking}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15">
                <Link href="/contact">{t.nav.contact}</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <Mail className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${email}`} className="text-sm opacity-90 hover:underline">
                  {email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Location</p>
                <div className="text-sm opacity-90 whitespace-pre-line">
                  {address}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <Clock className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Availability</p>
                <p className="text-sm opacity-90">{hours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
