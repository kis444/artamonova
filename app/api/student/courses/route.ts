import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Course } from '@/models/Course'
import { User } from '@/models/User'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const student = await User.findById((session.user as any).id)
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Find course matching student level
  const level = student.level || 'A1'
  const course = await Course.findOne({ level, active: true })

  return NextResponse.json({ course, studentLevel: level })
}