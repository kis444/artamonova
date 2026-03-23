'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale } from '@/lib/locale-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft, Edit, Loader2 } from 'lucide-react'

type BlogPost = {
  _id: string
  slug: string
  titleEn: string
  titleRo: string
  titleRu: string
  contentEn: string
  contentRo: string
  contentRu: string
  coverImage?: string
  published: boolean
  createdAt: string
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, t } = useLocale()
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  // Dezasamblează params cu React.use()
  const { slug } = use(params)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(res => res.json())
      .then(data => {
        setPost(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Article not found</h1>
        <Button className="mt-4" asChild>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    )
  }

  const title = locale === 'ro' ? post.titleRo || post.titleEn : 
                locale === 'ru' ? post.titleRu || post.titleEn : 
                post.titleEn

  const content = locale === 'ro' ? post.contentRo || post.contentEn : 
                  locale === 'ru' ? post.contentRu || post.contentEn : 
                  post.contentEn

  const isAdmin = session?.user?.role === 'admin'

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Article header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {/* Butonul de editare apare DOAR pentru admin */}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/admin/blog')}
              >
                <Edit className="mr-2 h-3 w-3" />
                Edit Article
              </Button>
            )}
          </div>

          <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
            {title}
          </h1>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <img 
              src={post.coverImage} 
              alt={title} 
              className="w-full max-h-100 object-cover"
            />
          </div>
        )}

        {/* Article content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  )
}