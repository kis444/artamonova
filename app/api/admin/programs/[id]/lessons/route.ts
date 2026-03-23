
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { LessonTemplate } from '@/models/LessonTemplate'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await connectDB()

  const lessons = await LessonTemplate.find({ programId: id }).sort({ lessonNumber: 1 })
  return NextResponse.json(lessons)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  await connectDB()

  // Auto-assign lesson number if not provided
  if (!body.lessonNumber) {
    const count = await LessonTemplate.countDocuments({ programId: id })
    body.lessonNumber = count + 1
  }

  const lesson = await LessonTemplate.create({
    programId: id,
    ...body
  })

  return NextResponse.json(lesson)
}
