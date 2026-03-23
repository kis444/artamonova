import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Enrollment } from '@/models/Enrollment'
import { LessonTemplate } from '@/models/LessonTemplate'
import { Program } from '@/models/Program'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const studentId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const programId = searchParams.get('programId')

  const enrollments = await Enrollment.find({ studentId, status: 'active' })
  if (enrollments.length === 0) return NextResponse.json({ lessons: [], course: null, programs: [] })

  // All enrolled programs info
  const allPrograms = await Promise.all(
    enrollments.map(async e => {
      const prog = await Program.findById(e.programId).select('nameEn nameRo nameRu level')
      return { _id: e.programId.toString(), name: prog?.nameEn || 'Program', level: prog?.level || '', currentLessonNumber: e.currentLessonNumber }
    })
  )

  // Select which enrollment to show
  const targetEnrollment = programId
    ? enrollments.find(e => e.programId.toString() === programId) || enrollments[0]
    : enrollments[0]

  const currentLessonNumber = targetEnrollment.currentLessonNumber || 0

  const lessons = await LessonTemplate.find({ programId: targetEnrollment.programId, active: true }).sort({ lessonNumber: 1 })

  const lessonList = lessons.map(lesson => {
    const isUnlocked = lesson.lessonNumber <= currentLessonNumber + 1
    return {
      _id: lesson._id,
      order: lesson.lessonNumber,
      titleEn: lesson.titleEn, titleRo: lesson.titleRo, titleRu: lesson.titleRu,
      descriptionEn: lesson.descriptionEn, descriptionRo: lesson.descriptionRo, descriptionRu: lesson.descriptionRu,
      skills: lesson.skills, materials: lesson.materials,
      isUnlocked,
      status: lesson.lessonNumber <= currentLessonNumber ? 'completed' : isUnlocked ? 'available' : 'locked',
    }
  })

  return NextResponse.json({
    lessons: lessonList,
    course: targetEnrollment.programId,
    programs: allPrograms,
    activeProgramId: targetEnrollment.programId.toString(),
  })
}