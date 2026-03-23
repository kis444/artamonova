'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale-context'
import { useContent } from '@/lib/useContent'
import { Button } from '@/components/ui/button'
import { Award, Users, ArrowRight } from 'lucide-react'

export function TeacherIntro() {
  const { locale } = useLocale()
  const content = useContent()

  const title = content[`teacherIntro.title.${locale}`] || 'Meet Your Teacher'
  const bio = content[`teacherIntro.bio.${locale}`] || 
    'With over 10 years of experience teaching English to students of all levels, I am passionate about helping you achieve your language goals.'
  const philosophy = content[`teacherIntro.philosophy.${locale}`] || 
    'I believe that every student learns differently. My approach combines structured lessons with conversational practice to build both confidence and competence.'

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src="/alexandra.PNG"
                alt="English Teacher"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-xl bg-card p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-serif font-semibold">CELTA Certified</p>
                  <p className="text-sm text-muted-foreground">Cambridge English</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              {bio}
            </p>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              {philosophy}
            </p>

            <div className="mb-8 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">500+</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">4</p>
                  <p className="text-sm text-muted-foreground">Certifications</p>
                </div>
              </div>
            </div>

            <Button asChild>
              <Link href="/about">
                Learn More About Me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}