import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Homework } from '@/models/Homework'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const studentId = (session.user as any).id

  const homework = await Homework.find({ studentId }).sort({ lessonNumber: 1, createdAt: -1 })
  return NextResponse.json(homework)
}
