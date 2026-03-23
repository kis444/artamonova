import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { LessonTemplate } from '@/models/LessonTemplate'
import { Enrollment } from '@/models/Enrollment'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const studentId = (session.user as any).id

  // Găsește toate înrolările active
  const enrollments = await Enrollment.find({ 
    studentId, 
    status: 'active' 
  }).populate('programId')

  const allMaterials: any[] = []

  for (const enrollment of enrollments) {
    const program = enrollment.programId
    if (!program) continue

    // Găsește toate lecțiile deblocate pentru acest program
    const lessons = await LessonTemplate.find({
      programId: program._id,
      lessonNumber: { $lte: enrollment.currentLessonNumber },
      active: true
    })

    for (const lesson of lessons) {
      if (lesson.materials && lesson.materials.length > 0) {
        for (const material of lesson.materials) {
          allMaterials.push({
            _id: `${lesson._id}_${material.title}`,
            lessonId: lesson._id,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleEn,
            programName: program.nameEn,
            type: material.type,
            title: material.title,
            url: material.url,
            description: material.description || ''
          })
        }
      }
    }
  }

  return NextResponse.json({ materials: allMaterials })
}
