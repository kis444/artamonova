import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { PlacementQuestion } from '@/models/PlacementQuestion'
import { SkillProgress } from '@/models/SkillProgress'
import { User } from '@/models/User'
import { Enrollment } from '@/models/Enrollment'
import { Program } from '@/models/Program'
import { LessonTemplate } from '@/models/LessonTemplate'
import { HomeworkTemplate } from '@/models/HomeworkTemplate'
import { Homework } from '@/models/Homework'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers } = await req.json()
  if (!answers) return NextResponse.json({ error: 'answers required' }, { status: 400 })

  await connectDB()

  const questions = await PlacementQuestion.find({ active: true }).sort({ order: 1 })
  if (questions.length === 0) {
    return NextResponse.json({ level: 'A1', percentage: 0, message: 'No questions found' })
  }

  // Score per level
  const levelScores: Record<string, { correct: number; total: number }> = {}
  for (const q of questions) {
    const level = q.level
    if (!levelScores[level]) levelScores[level] = { correct: 0, total: 0 }
    levelScores[level].total++
    if (Number(answers[q._id.toString()]) === Number(q.correctAnswer)) {
      levelScores[level].correct++
    }
  }

  const totalCorrect = Object.values(levelScores).reduce((s, l) => s + l.correct, 0)
  const percentage = Math.round((totalCorrect / questions.length) * 100)

  let currentLevel = 'A1'
  if (percentage >= 85) currentLevel = 'C1'
  else if (percentage >= 70) currentLevel = 'B2'
  else if (percentage >= 50) currentLevel = 'B1'
  else if (percentage >= 30) currentLevel = 'A2'

  const levelToBase: Record<string, number> = { A1: 5, A2: 15, B1: 30, B2: 50, C1: 70, C2: 85 }
  const base = levelToBase[currentLevel] || 5

  const studentId = (session.user as any).id

  // Create/update SkillProgress
  const existing = await SkillProgress.findOne({ studentId })
  if (!existing) {
    await SkillProgress.create({
      studentId,
      grammar: base, vocabulary: base,
      speaking: Math.max(0, base - 5), writing: Math.max(0, base - 5),
      listening: base, reading: base,
      history: [],
    })
  }

  // Update user level
  await User.findByIdAndUpdate(studentId, { level: currentLevel })

  // Auto-enroll in matching program
  const program = await Program.findOne({ level: currentLevel, active: true })
  let enrolledProgram = null
  if (program) {
    const existingEnrollment = await Enrollment.findOne({ studentId, programId: program._id })
    if (!existingEnrollment) {
      await Enrollment.create({ studentId, programId: program._id, status: 'active', currentLessonNumber: 0 })

      // Generate homework for lesson 1
      const student = await User.findById(studentId)
      const firstLesson = await LessonTemplate.findOne({ programId: program._id, lessonNumber: 1, active: true })
      if (firstLesson) {
        const templates = await HomeworkTemplate.find({ lessonId: firstLesson._id, active: true })
        for (const tmpl of templates) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + (tmpl.dueDaysAfterUnlock || 7))
          await Homework.create({
            studentId, studentName: student?.name || '',
            title: tmpl.title, description: tmpl.description,
            instructions: tmpl.instructions,
            dueDate: dueDate.toISOString().split('T')[0],
            type: tmpl.type, lessonId: firstLesson._id,
            lessonNumber: 1, lessonTitle: firstLesson.titleEn,
            questions: tmpl.questions,
            maxScore: tmpl.questions?.reduce((s: number, q: any) => s + (q.points || 1), 0) || 0,
            status: 'pending',
          })
        }
      }
      enrolledProgram = program.nameEn
    }
  }

  return NextResponse.json({
    level: currentLevel, percentage, levelScores,
    enrolledIn: enrolledProgram,
    message: enrolledProgram
      ? `Your level is ${currentLevel}. You've been enrolled in "${enrolledProgram}"!`
      : `Your level is ${currentLevel}.`,
  })
}