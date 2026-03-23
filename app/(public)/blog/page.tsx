'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowRight, Clock, Loader2 } from 'lucide-react'

type Post = {
  _id: string; slug: string
  titleEn: string; titleRo: string; titleRu: string
  excerptEn: string; excerptRo: string; excerptRu: string
  coverImage: string; createdAt: string
}

export default function BlogPage() {
  const { locale, t } = useLocale()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const getTitle = (post: Post) => {
    if (locale === 'ro' && post.titleRo) return post.titleRo
    if (locale === 'ru' && post.titleRu) return post.titleRu
    return post.titleEn
  }

  const getExcerpt = (post: Post) => {
    if (locale === 'ro' && post.excerptRo) return post.excerptRo
    if (locale === 'ru' && post.excerptRu) return post.excerptRu
    return post.excerptEn
  }

  return (
    <div className="py-12">
      <section className="container mx-auto mb-12 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
            {t.blog.title}
          </h1>
          <p className="text-lg text-muted-foreground">{t.blog.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post._id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video overflow-hidden bg-muted">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={getTitle(post)}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/5">
                      <span className="font-serif text-4xl text-primary/20">✍</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString(
                        locale === 'ru' ? 'ru-RU' : locale === 'ro' ? 'ro-RO' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />5 min read
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 font-serif text-xl transition-colors group-hover:text-primary">
                    <Link href={`/blog/${post.slug}`}>{getTitle(post)}</Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{getExcerpt(post)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    {t.blog.readMore}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
          <h2 className="mb-4 font-serif text-2xl font-bold md:text-3xl">Subscribe to My Newsletter</h2>
          <p className="mx-auto mb-6 max-w-xl opacity-90">
            Get weekly English tips and exclusive content delivered to your inbox.
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border-0 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
            />
            <button
              type="submit"
              className="rounded-lg bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}