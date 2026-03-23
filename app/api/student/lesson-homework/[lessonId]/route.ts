import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Homework } from '@/models/Homework'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lessonId } = await params
  await connectDB()

  const homework = await Homework.find({
    studentId: (session.user as any).id,
    lessonId: lessonId
  }).sort({ createdAt: 1 })

  return NextResponse.json(homework)
}
