import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { BlogPost } from '@/models/BlogPost'

// GET all published posts
export async function GET() {
  await connectDB()
  const posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 })
  return NextResponse.json(posts)
}

// POST create new post (admin only)
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { titleEn, titleRo, titleRu, excerptEn, excerptRo, excerptRu,
    contentEn, contentRo, contentRu, coverImage, published } = body

  if (!titleEn) return NextResponse.json({ error: 'Title (EN) required' }, { status: 400 })

  await connectDB()

  // Generate slug from EN title
  const baseSlug = titleEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Make slug unique
  let slug = baseSlug
  let count = 1
  while (await BlogPost.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`
  }

  const post = await BlogPost.create({
    slug, titleEn, titleRo, titleRu,
    excerptEn, excerptRo, excerptRu,
    contentEn, contentRo, contentRu,
    coverImage, published: published ?? true,
  })

  return NextResponse.json(post)
}