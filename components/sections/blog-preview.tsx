'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Calendar, Loader2 } from 'lucide-react'

type BlogPost = {
  _id: string
  slug: string
  titleEn: string
  titleRo: string
  titleRu: string
  excerptEn: string
  excerptRo: string
  excerptRu: string
  coverImage?: string
  published: boolean
  createdAt: string
}

export function BlogPreview() {
  const { locale, t } = useLocale()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        // Filtrăm doar articolele publicate și luăm primele 3
        const published = Array.isArray(data) 
          ? data.filter((p: BlogPost) => p.published).slice(0, 3)
          : []
        setPosts(published)
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

  if (posts.length === 0) {
    return null // Nu afișa secțiunea dacă nu există articole
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {t.blog.title}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t.blog.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Card key={post._id} className="group overflow-hidden transition-all hover:shadow-lg">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt="" 
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/5">
                      <span className="text-4xl opacity-20">📝</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <CardTitle className="line-clamp-2 font-serif text-lg transition-colors group-hover:text-primary">
                    {locale === 'ro' ? post.titleRo || post.titleEn : 
                     locale === 'ru' ? post.titleRu || post.titleEn : 
                     post.titleEn}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {locale === 'ro' ? post.excerptRo || post.excerptEn : 
                     locale === 'ru' ? post.excerptRu || post.excerptEn : 
                     post.excerptEn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    {t.blog.readMore}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}