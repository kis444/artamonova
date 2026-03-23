import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Review } from '@/models/Review'

// GET /api/reviews - get all reviews
export async function GET() {
  await connectDB()
  const reviews = await Review.find({}).sort({ order: 1, createdAt: -1 })
  return NextResponse.json(reviews)
}

// POST /api/reviews - add a review (admin only)
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  if (!body.name || !body.text || !body.rating || !body.program) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await connectDB()
  const review = await Review.create(body)
  return NextResponse.json(review)
}

// PUT /api/reviews/[id] - update a review (admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  
  await connectDB()
  const review = await Review.findByIdAndUpdate(id, body, { new: true })
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }
  return NextResponse.json(review)
}

// DELETE /api/reviews/[id] - delete a review (admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  
  await connectDB()
  await Review.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}