import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Enrollment } from '@/models/Enrollment'
import { LessonTemplate } from '@/models/LessonTemplate'
import { HomeworkTemplate } from '@/models/HomeworkTemplate'
import { Homework } from '@/models/Homework'
import { User } from '@/models/User'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { programId } = await req.json()
  if (!programId) return NextResponse.json({ error: 'programId required' }, { status: 400 })

  const studentId = (session.user as any).id
  await connectDB()

  const existing = await Enrollment.findOne({ studentId, programId })
  if (existing) return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })

  const enrollment = await Enrollment.create({ studentId, programId, status: 'active', currentLessonNumber: 0 })

  // Generate lesson 1 homework
  const student = await User.findById(studentId)
  const firstLesson = await LessonTemplate.findOne({ programId, lessonNumber: 1, active: true })
  if (firstLesson) {
    const templates = await HomeworkTemplate.find({ lessonId: firstLesson._id, active: true })
    for (const tmpl of templates) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (tmpl.dueDaysAfterUnlock || 7))
      await Homework.create({
        studentId, studentName: student?.name || '',
        title: tmpl.title, description: tmpl.description, instructions: tmpl.instructions,
        dueDate: dueDate.toISOString().split('T')[0],
        type: tmpl.type, lessonId: firstLesson._id,
        lessonNumber: 1, lessonTitle: firstLesson.titleEn,
        questions: tmpl.questions,
        maxScore: tmpl.questions?.reduce((s: number, q: any) => s + (q.points || 1), 0) || 0,
        status: 'pending',
      })
    }
  }

  return NextResponse.json({ enrollment, message: 'Enrolled successfully' })
}