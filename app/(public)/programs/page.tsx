'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Briefcase, Award, Target, Sprout, MessageCircle, ArrowRight, Clock, BarChart3, Loader2 } from 'lucide-react'

type Program = {
  _id: string
  nameEn: string
  nameRo: string
  nameRu: string
  descriptionEn: string
  descriptionRo: string
  descriptionRu: string
  level: string
  duration: string
  price: number
  icon: string
  active: boolean
}

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen className="h-8 w-8" />,
  briefcase: <Briefcase className="h-8 w-8" />,
  award: <Award className="h-8 w-8" />,
  target: <Target className="h-8 w-8" />,
  seedling: <Sprout className="h-8 w-8" />,
  'message-circle': <MessageCircle className="h-8 w-8" />,
}

export default function ProgramsPage() {
  const { locale, t } = useLocale()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/programs', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { 
        setPrograms(Array.isArray(data) ? data : [])
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [])

  const getName = (p: Program) => locale === 'ro' ? p.nameRo || p.nameEn : locale === 'ru' ? p.nameRu || p.nameEn : p.nameEn
  const getDesc = (p: Program) => locale === 'ro' ? p.descriptionRo || p.descriptionEn : locale === 'ru' ? p.descriptionRu || p.descriptionEn : p.descriptionEn

  return (
    <div className="py-12">
      <section className="container mx-auto mb-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">{t.programs.title}</h1>
          <p className="text-lg text-muted-foreground">{t.programs.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20" suppressHydrationWarning>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : programs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground" suppressHydrationWarning>
            <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No programs available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {programs.map((p, index) => (
              <Card key={p._id} className="overflow-hidden relative">
                {index === 0 && (
                  <Badge className="absolute -left-8 top-6 -rotate-45 bg-primary px-8 py-1 text-xs">
                    Most Popular
                  </Badge>
                )}
                {index === 1 && (
                  <Badge className="absolute -left-8 top-6 -rotate-45 bg-secondary px-8 py-1 text-xs">
                    Recommended
                  </Badge>
                )}
                <CardHeader className="bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {iconMap[p.icon] || <BookOpen className="h-8 w-8" />}
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-3xl font-bold text-foreground">€{p.price}</p>
                      <p className="text-sm text-muted-foreground">{t.programs.perLesson}</p>
                    </div>
                  </div>
                  <CardTitle className="mt-4 font-serif text-2xl">{getName(p)}</CardTitle>
                  <CardDescription className="text-base">{getDesc(p)}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t.programs.level}: {p.level}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t.programs.duration}: {p.duration}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30">
                  <Button asChild className="w-full">
                    <Link href={`/booking?program=${p._id}`}>
                      {t.programs.bookLesson}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold">Not Sure Which Program to Choose?</h2>
            <p className="mb-8 text-lg opacity-90">Take our free placement test to discover your current level.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/placement-test">Take Placement Test <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                <Link href="/contact">Contact Me</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}