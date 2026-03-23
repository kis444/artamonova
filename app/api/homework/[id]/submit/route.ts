import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Homework } from '@/models/Homework'
import { Enrollment } from '@/models/Enrollment'
import { LessonTemplate } from '@/models/LessonTemplate'
import { Notification } from '@/models/Notification'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const studentId = (session.user as any).id
    const body = await req.json()

    await connectDB()

    const homework = await Homework.findById(id)
    if (!homework) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (homework.studentId.toString() !== studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // QUIZ: auto-grade
    if (homework.type === 'quiz' && body.answers) {
      const questions = homework.questions || []
      let score = 0
      const gradedAnswers = questions.map((q: any, idx: number) => {
        const userAnswer = body.answers[idx]
        let isCorrect = false
        let pointsEarned = 0
        if (q.type === 'multiple_choice') {
          isCorrect = Number(userAnswer) === Number(q.correctAnswer)
          pointsEarned = isCorrect ? (q.points || 1) : 0
        }
        if (isCorrect) score += pointsEarned
        return { questionIndex: idx, answer: userAnswer, isCorrect, pointsEarned }
      })
      const maxScore = questions.reduce((s: number, q: any) => s + (q.points || 1), 0)

      homework.answers = gradedAnswers
      homework.score = score
      homework.maxScore = maxScore
      homework.status = 'auto_graded'
      await homework.save()

      await tryUnlockNextLesson(studentId, homework.lessonId?.toString(), homework.lessonNumber)
      return NextResponse.json({ success: true, score, maxScore, answers: gradedAnswers })
    }

    // WRITING / FILE
    homework.submissionText = body.submissionText || ''
    homework.submissionFileUrl = body.submissionFileUrl || ''
    homework.submissionFileName = body.submissionFileName || ''
    homework.status = 'submitted'
    await homework.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SUBMIT ERROR:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function tryUnlockNextLesson(studentId: string, lessonId: string | undefined, lessonNumber: number | undefined) {
  if (!lessonNumber) return
  try {
    const lesson = await LessonTemplate.findById(lessonId)
    if (!lesson) return

    const enrollment = await Enrollment.findOne({ studentId, programId: lesson.programId })
    if (!enrollment) return

    if (enrollment.currentLessonNumber < lessonNumber) {
      enrollment.currentLessonNumber = lessonNumber
      await enrollment.save()

      // Notify student that next lesson is unlocked
      const nextLessonNum = lessonNumber + 1
      const nextLesson = await LessonTemplate.findOne({ programId: lesson.programId, lessonNumber: nextLessonNum, active: true })
      if (nextLesson) {
        await Notification.create({
          userId: studentId,
          title: '🔓 New Lesson Unlocked!',
          message: `Lesson ${nextLessonNum}: "${nextLesson.titleEn}" is now available!`,
          type: 'lesson_unlocked',
          link: '/dashboard/lessons',
        })
      }
    }
  } catch (e) {
    console.error('Unlock error:', e)
  }
}