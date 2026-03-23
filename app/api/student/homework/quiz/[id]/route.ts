import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { HomeworkSubmission } from '@/models/HomeworkSubmission'
import { HomeworkTemplate } from '@/models/HomeworkTemplate'
import { SkillProgress } from '@/models/SkillProgress'
import { Course } from '@/models/Course'
import { User } from '@/models/User'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { answers } = await req.json()

  await connectDB()

  const submission = await HomeworkSubmission.findById(id)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // Verify student owns this submission
  if (submission.studentId.toString() !== (session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const template = await HomeworkTemplate.findById(submission.templateId)
  if (!template || template.type !== 'quiz') {
    return NextResponse.json({ error: 'Not a quiz' }, { status: 400 })
  }

  // Auto-correct
  let totalPoints = 0
  let earnedPoints = 0
  const correctedAnswers = []

  for (let i = 0; i < template.questions.length; i++) {
    const q = template.questions[i]
    const userAnswer = answers[i]
    totalPoints += q.points
    
    let isCorrect = false
    if (q.type === 'multiple_choice') {
      isCorrect = userAnswer === q.correctAnswer
    } else if (q.type === 'text') {
      // Simple text match (case insensitive, trim)
      isCorrect = userAnswer?.toString().toLowerCase().trim() === q.correctAnswer?.toString().toLowerCase().trim()
    }
    
    if (isCorrect) {
      earnedPoints += q.points
    }
    
    correctedAnswers.push({
      questionId: i,
      answer: userAnswer,
      isCorrect,
      pointsEarned: isCorrect ? q.points : 0
    })
  }

  const score = Math.round((earnedPoints / totalPoints) * 10) // 1-10 scale
  submission.answers = correctedAnswers
  submission.score = score
  submission.status = 'auto_graded'
  submission.submittedAt = new Date()
  await submission.save()

  // Update SkillProgress based on quiz score
  const studentId = submission.studentId
  const student = await User.findById(studentId)
  const course = await Course.findOne({ level: student?.level || 'A1', active: true })
  const maxLevel = course?.levelRange?.max || 100

  let skillProgress = await SkillProgress.findOne({ studentId })
  if (!skillProgress) {
    skillProgress = await SkillProgress.create({
      studentId,
      grammar: 5, vocabulary: 5, speaking: 5, writing: 5, listening: 5, reading: 5,
      history: []
    })
  }

  // Map quiz to skills (grammar & vocabulary)
  const affectedSkills = ['grammar', 'vocabulary']
  const historyEntries = []

  for (const skill of affectedSkills) {
    const oldValue = (skillProgress as any)[skill] || 0
    const scoreAs100 = score * 10
    let newValue = Math.round(oldValue * 0.7 + scoreAs100 * 0.3)
    newValue = Math.min(newValue, maxLevel)
    newValue = Math.min(100, Math.max(0, newValue))
    ;(skillProgress as any)[skill] = newValue
    historyEntries.push({
      skill,
      oldValue,
      newValue,
      source: 'homework',
      sourceId: submission._id,
    })
  }

  skillProgress.history.push(...historyEntries)
  skillProgress.lastUpdated = new Date()
  await skillProgress.save()

  return NextResponse.json({ success: true, score, totalPoints: totalPoints, earnedPoints })
}