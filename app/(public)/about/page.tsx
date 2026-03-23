'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale-context'
import { useContent } from '@/lib/useContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, Heart, Target, ArrowRight, Loader2, BookOpen, ExternalLink } from 'lucide-react'

type TimelineItem = { _id: string; year: string; eventEn: string; eventRo: string; eventRu: string }
type Certification = { 
  _id: string; 
  titleEn: string; 
  titleRo: string; 
  titleRu: string; 
  issuer: string; 
  year: string; 
  pdfUrl?: string;
  imageUrl?: string 
}

export default function AboutPage() {
  const { locale } = useLocale()
  const content = useContent()
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/timeline').then(r => r.json()),
      fetch('/api/certifications').then(r => r.json()),
    ]).then(([timelineData, certsData]) => {
      setTimeline(Array.isArray(timelineData) ? timelineData : [])
      setCertifications(Array.isArray(certsData) ? certsData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const title = content[`about.title.${locale}`] || 'About Me'
  const bio = content[`about.bio.${locale}`] || 
    'Hello! I am Alexandra, a certified English teacher with over 10 years of experience helping students from all walks of life achieve their language goals.'
  const philosophyTitle = content[`philosophy.title.${locale}`] || 'Teaching Philosophy'
  const philosophyText = content[`philosophy.text.${locale}`] || 
    'I believe that every student learns differently. My approach combines structured lessons with conversational practice to build both confidence and competence. I combine traditional teaching methods with modern communicative approaches. Every lesson is designed to be engaging, practical, and directly applicable to your real-life needs.'

  const getTimelineEvent = (item: any) => {
    if (locale === 'ro' && item.eventRo) return item.eventRo
    if (locale === 'ru' && item.eventRu) return item.eventRu
    return item.eventEn
  }

  const getCertTitle = (cert: Certification) => {
    if (locale === 'ro' && cert.titleRo) return cert.titleRo
    if (locale === 'ru' && cert.titleRu) return cert.titleRu
    return cert.titleEn
  }

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'I genuinely love teaching and seeing my students succeed in their English journey.',
      titleRo: 'Pasiune',
      descriptionRo: 'Îmi place cu adevărat să predau și să văd succesul studenților mei în călătoria lor cu limba engleză.'
    },
    {
      icon: Target,
      title: 'Personalization',
      description: 'Every student is unique. I tailor my approach to match your learning style and goals.',
      titleRo: 'Personalizare',
      descriptionRo: 'Fiecare student este unic. Îmi adaptez abordarea pentru a se potrivi stilului tău de învățare și obiectivelor tale.'
    },
    {
      icon: Users,
      title: 'Support',
      description: 'You are never alone in your learning journey. I provide ongoing support and feedback.',
      titleRo: 'Suport',
      descriptionRo: 'Nu ești niciodată singur în călătoria ta de învățare. Ofer suport și feedback continuu.'
    },
  ]

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      {/* Hero */}
      <section className="container mx-auto mb-16 px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 font-serif text-4xl font-bold text-foreground md:text-5xl">
              {title}
            </h1>
            <div className="space-y-4 text-muted-foreground">
              {bio.split('\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src="/kisa.PNG"
              alt="English Teacher"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 font-serif text-3xl font-bold text-foreground">
              {philosophyTitle}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              {philosophyText}
            </p>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      {certifications.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center font-serif text-3xl font-bold text-foreground">
              {locale === 'ro' ? 'Certificări' : locale === 'ru' ? 'Сертификаты' : 'Certifications'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certifications.map((cert) => (
                <Card key={cert._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{getCertTitle(cert)}</h3>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground mt-1">{cert.year}</p>
                        {cert.pdfUrl && cert.pdfUrl.trim() !== '' && (
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teaching Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center font-serif text-3xl font-bold text-foreground">
            {locale === 'ro' ? 'Valorile mele de predare' : locale === 'ru' ? 'Мои ценности преподавания' : 'My Teaching Values'}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              const valueTitle = locale === 'ro' && value.titleRo ? value.titleRo : value.title
              const valueDesc = locale === 'ro' && value.descriptionRo ? value.descriptionRo : value.description
              return (
                <Card key={value.title}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold">{valueTitle}</h3>
                    <p className="text-sm text-muted-foreground">{valueDesc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center font-serif text-3xl font-bold text-foreground">
            {locale === 'ro' ? 'Experiență' : locale === 'ru' ? 'Опыт' : 'Experience'}
          </h2>
          <div className="mx-auto max-w-2xl">
            {timeline.length === 0 ? (
              <p className="text-center text-muted-foreground">No timeline events yet.</p>
            ) : (
              <div className="relative border-l-2 border-primary/20 pl-8">
                {timeline.map((item, index) => (
                  <div key={item._id} className="relative mb-8 last:mb-0">
                    <div className="absolute -left-10.25 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-primary">{item.year}</p>
                    <p className="text-muted-foreground">{getTimelineEvent(item)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
            {locale === 'ro' ? 'Gata să începi să înveți?' : locale === 'ru' ? 'Готовы начать учиться?' : 'Ready to Start Learning?'}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {locale === 'ro' ? 'Rezervă o lecție de probă pentru a vedea dacă ne potrivim sau susține testul de plasament pentru a afla nivelul tău actual.' : 
              locale === 'ru' ? 'Запишитесь на пробный урок, чтобы понять, подходим ли мы друг другу, или пройдите тест для определения вашего текущего уровня.' : 
              'Book a trial lesson to see if we are a good fit, or take the placement test to find out your current level.'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/booking">
                {locale === 'ro' ? 'Rezervă o lecție' : locale === 'ru' ? 'Записаться на урок' : 'Book a Lesson'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/placement-test">
                {locale === 'ro' ? 'Test de plasament' : locale === 'ru' ? 'Тест на уровень' : 'Placement Test'}
                <BookOpen className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
