import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { LessonTemplate } from '@/models/LessonTemplate'

// GET /api/admin/programs/[id]/lessons - get all lessons for a program
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

// POST /api/admin/programs/[id]/lessons - create new lesson
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
  let lessonNumber = body.lessonNumber
  if (!lessonNumber || lessonNumber === 0) {
    const count = await LessonTemplate.countDocuments({ programId: id })
    lessonNumber = count + 1
  }

  const lesson = await LessonTemplate.create({
    programId: id,
    lessonNumber,
    titleEn: body.titleEn,
    titleRo: body.titleRo || '',
    titleRu: body.titleRu || '',
    descriptionEn: body.descriptionEn || '',
    descriptionRo: body.descriptionRo || '',
    descriptionRu: body.descriptionRu || '',
    skills: body.skills || [],
    duration: body.duration || 60,
    active: body.active !== false,
  })

  return NextResponse.json(lesson)
}