'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Briefcase, Award, Target, Sprout, MessageCircle, ArrowRight, Loader2 } from 'lucide-react'

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
  book: <BookOpen className="h-6 w-6" />,
  briefcase: <Briefcase className="h-6 w-6" />,
  award: <Award className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
  seedling: <Sprout className="h-6 w-6" />,
  'message-circle': <MessageCircle className="h-6 w-6" />,
}

export function ProgramsPreview() {
  const { locale, t } = useLocale()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/programs', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setPrograms(Array.isArray(data) ? data.slice(0, 6) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getName = (p: Program) => locale === 'ro' ? p.nameRo || p.nameEn : locale === 'ru' ? p.nameRu || p.nameEn : p.nameEn
  const getDesc = (p: Program) => locale === 'ro' ? p.descriptionRo || p.descriptionEn : locale === 'ru' ? p.descriptionRu || p.descriptionEn : p.descriptionEn

  if (loading) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    )
  }

  if (programs.length === 0) {
    return null
  }

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {t.programs.title}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t.programs.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program._id} className="group transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {iconMap[program.icon] || <BookOpen className="h-6 w-6" />}
                </div>
                <CardTitle className="font-serif">
                  {getName(program)}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {getDesc(program)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{program.level}</Badge>
                  <Badge variant="outline">{program.duration}</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <p className="font-serif text-2xl font-bold text-foreground">
                  €{program.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}/{t.programs.perLesson}
                  </span>
                </p>
                <Button variant="ghost" size="sm" asChild className="group/btn">
                  <Link href={`/booking?program=${program._id}`}>
                    {t.programs.bookLesson}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/programs">
              View All Programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}