'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MapPin, Clock, Phone, Instagram, Facebook, Send, CheckCircle, User, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const { t, locale } = useLocale()
  const [submitted, setSubmitted] = useState(false)
  const [content, setContent] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

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
  const phone = getValue('contact.phone') || '+373 69 619 459'
  const address = getValue('contact.address') || 'Online lessons worldwide\nBased in Chisinau, Moldova'
  const facebook = getValue('contact.facebook') || ''
  const instagram = getValue('contact.instagram') || ''
  const hours = 'Monday - Friday, 9:00 - 18:00 (EET)'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="mb-4 font-serif text-3xl font-bold text-foreground">
              {t.contact.success || 'Message Sent!'}
            </h1>
            <p className="mb-8 text-muted-foreground">
              Thank you for reaching out! I will get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      {/* Hero */}
      <section className="container mx-auto mb-12 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
            {t.contact.title || 'Contact Me'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.contact.subtitle || 'Have questions? I\'d love to hear from you.'}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Send a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and I will get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {t.contact.name || 'Your Name'}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {t.contact.email || 'Email'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        {t.contact.message || 'Message'}
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell me about your English learning goals..."
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {t.contact.send || 'Send Message'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-primary">
                          {email}
                        </a>
                      </div>
                    </div>

                    {phone && (
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Phone</p>
                          <a href={`tel:${phone}`} className="text-sm text-muted-foreground hover:text-primary">
                            {phone}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Location</p>
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Hours</p>
                        <p className="text-sm text-muted-foreground">{hours}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(facebook || instagram) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Follow Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 flex-wrap">
                      {instagram && (
                        <a
                          href={instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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
                          className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <h3 className="mb-2 font-serif text-lg font-semibold">Quick Response</h3>
                  <p className="text-sm opacity-90">
                    I typically respond to all inquiries within 24 hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
