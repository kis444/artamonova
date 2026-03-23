import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Enrollment } from '@/models/Enrollment'
import { Program } from '@/models/Program'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const studentId = (session.user as any).id

  const enrollments = await Enrollment.find({ 
    studentId, 
    status: 'active' 
  }).populate('programId')

  const programs = enrollments.map(e => ({
    _id: e.programId._id,
    nameEn: e.programId.nameEn,
    nameRo: e.programId.nameRo,
    nameRu: e.programId.nameRu,
    level: e.programId.level,
    duration: e.programId.duration,
    price: e.programId.price,
    descriptionEn: e.programId.descriptionEn,
    currentLessonNumber: e.currentLessonNumber,
    startedAt: e.startedAt
  }))

  return NextResponse.json({ programs })
}
