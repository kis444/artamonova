// app/api/admin/lessons/[id]/homework/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'  // ← corectează aici
import { HomeworkTemplate } from '@/models/HomeworkTemplate'
import { Homework } from '@/models/Homework'
import { LessonTemplate } from '@/models/LessonTemplate'
import { Enrollment } from '@/models/Enrollment'
import { User } from '@/models/User'
import { Notification } from '@/models/Notification'

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
  const templates = await HomeworkTemplate.find({ lessonId: id, active: true }).sort({ order: 1 })
  return NextResponse.json(templates)
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

  const lesson = await LessonTemplate.findById(id)
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  // Adaugă programId la template
  const template = await HomeworkTemplate.create({ 
    lessonId: id, 
    programId: lesson.programId, // ← ASTA LIPSEA
    ...body 
  })

  // Găsește toți studenții înrolați în acest program
  const enrollments = await Enrollment.find({ 
    programId: lesson.programId, 
    status: 'active' 
  })

  console.log(`Found ${enrollments.length} students in program ${lesson.programId}`)

  const homeworkDocs = []
  for (const enrollment of enrollments) {
    const student = await User.findById(enrollment.studentId)
    if (!student) continue

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (template.dueDaysAfterUnlock || 7))

    homeworkDocs.push({
      studentId: enrollment.studentId,
      studentName: student.name,
      programId: lesson.programId, // Adaugă și aici programId
      templateId: template._id,
      title: template.title,
      description: template.description,
      instructions: template.instructions,
      dueDate: dueDate.toISOString().split('T')[0],
      type: template.type,
      lessonId: id,
      lessonNumber: lesson.lessonNumber,
      lessonTitle: lesson.titleEn,
      questions: template.questions || [],
      maxScore: template.questions?.reduce((s: number, q: any) => s + (q.points || 1), 0) || 0,
      status: 'pending',
    })
  }

  if (homeworkDocs.length > 0) {
    await Homework.insertMany(homeworkDocs)
    console.log(`Created ${homeworkDocs.length} homework assignments`)

    // Notifică fiecare student
    const notifications = homeworkDocs.map(hw => ({
      userId: hw.studentId,
      title: '📝 New Homework Assigned',
      message: `Lesson ${lesson.lessonNumber}: "${template.title}" — due in ${template.dueDaysAfterUnlock || 7} days.`,
      type: 'general',
      link: '/dashboard/homework',
    }))
    await Notification.insertMany(notifications)
    console.log(`Sent ${notifications.length} notifications`)
  }

  return NextResponse.json({
    template,
    generatedFor: homeworkDocs.length,
    message: `Homework created for ${homeworkDocs.length} students`,
  })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()
  await HomeworkTemplate.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}