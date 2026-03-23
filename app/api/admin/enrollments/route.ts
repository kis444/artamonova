import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Enrollment } from '@/models/Enrollment'
import { LessonTemplate } from '@/models/LessonTemplate'
import { HomeworkTemplate } from '@/models/HomeworkTemplate'
import { Homework } from '@/models/Homework'
import { User } from '@/models/User'

// POST enroll a student in a program
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { studentId, programId } = await req.json()
  if (!studentId || !programId) {
    return NextResponse.json({ error: 'studentId and programId required' }, { status: 400 })
  }

  await connectDB()

  // Check if already enrolled
  const existing = await Enrollment.findOne({ studentId, programId })
  if (existing) {
    return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })
  }

  const enrollment = await Enrollment.create({
    studentId,
    programId,
    status: 'active',
    currentLessonNumber: 0,
  })

  // Generate homework for lesson 1 (first unlocked lesson)
  const firstLesson = await LessonTemplate.findOne({ programId, lessonNumber: 1, active: true })
  if (firstLesson) {
    const templates = await HomeworkTemplate.find({ lessonId: firstLesson._id, active: true })
    const student = await User.findById(studentId)

    for (const template of templates) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (template.dueDaysAfterUnlock || 7))

      await Homework.create({
        studentId,
        studentName: student?.name || '',
        title: template.title,
        description: template.description,
        instructions: template.instructions,
        dueDate: dueDate.toISOString().split('T')[0],
        type: template.type,
        lessonId: firstLesson._id,
        lessonNumber: 1,
        lessonTitle: firstLesson.titleEn,
        questions: template.questions,
        maxScore: template.questions?.reduce((s: number, q: any) => s + (q.points || 1), 0) || 0,
        status: 'pending',
      })
    }
  }

  return NextResponse.json({ enrollment, message: 'Student enrolled successfully' })
}

// GET all enrollments (admin)
export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const enrollments = await Enrollment.find({})
    .populate('studentId', 'name email level')
    .populate('programId', 'nameEn level')
    .sort({ createdAt: -1 })

  return NextResponse.json(enrollments)
}