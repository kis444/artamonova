'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { useContent } from '@/lib/useContent'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote, Loader2 } from 'lucide-react'

type Review = {
  _id: string
  name: string
  text: string
  textRo: string
  rating: number
  program: string
}

export function Reviews() {
  const { locale } = useLocale()
  const content = useContent()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Obține titlurile din content
  const title = content[`reviews.title.${locale}`] || 'What Students Say'
  const subtitle = content[`reviews.subtitle.${locale}`] || 'Reviews from My Students'

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return null
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <Card key={review._id} className="relative">
              <CardContent className="pt-6">
                <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {locale === 'en' ? review.text : review.textRo}
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-medium text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.program}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}