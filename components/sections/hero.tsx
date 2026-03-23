'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale-context'
import { useContent } from '@/lib/useContent'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  const { locale } = useLocale()
  const content = useContent()

  const title = content[`hero.title.${locale}`] || 'Master English with Confidence'
  const subtitle = content[`hero.subtitle.${locale}`] || 
    'Personalized one-on-one lessons tailored to your goals, schedule, and learning style.'

  return (
    <section className="relative overflow-hidden py-20 md:py-20">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.jpeg"
          alt="English Teacher"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-white/80" />
            <span className="text-white/80">Private English Lessons</span>
          </div>

          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            <span className="text-balance">{title}</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="group relative overflow-hidden">
              <Link href="/booking">
                Book your first lesson
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
              <Link href="/placement-test">Take Placement Test</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/20 pt-8">
            <div>
              <p className="font-serif text-3xl font-bold text-white md:text-4xl">10+</p>
              <p className="text-sm text-white/60">Years Experience</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-white md:text-4xl">500+</p>
              <p className="text-sm text-white/60">Students Taught</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-white md:text-4xl">98%</p>
              <p className="text-sm text-white/60">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}