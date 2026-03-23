import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Homework } from '@/models/Homework'
import { SkillProgress } from '@/models/SkillProgress'
import { Notification } from '@/models/Notification'

const typeToSkills: Record<string, string[]> = {
  quiz: ['grammar', 'vocabulary'],
  writing: ['writing', 'grammar'],
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { feedback, score } = await req.json()
  if (!feedback) return NextResponse.json({ error: 'Feedback required' }, { status: 400 })

  await connectDB()
  const homework = await Homework.findById(id)
  if (!homework) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  homework.feedback = feedback
  homework.score = score || null
  homework.status = 'graded'
  homework.gradedAt = new Date()
  await homework.save()

  // Update SkillProgress
  if (score && score >= 1 && score <= 10) {
    const studentId = homework.studentId
    let skillProgress = await SkillProgress.findOne({ studentId })
    if (!skillProgress) {
      skillProgress = await SkillProgress.create({
        studentId, grammar: 5, vocabulary: 5, speaking: 5,
        writing: 5, listening: 5, reading: 5, history: [],
      })
    }
    const skills = typeToSkills[homework.type || 'quiz'] || ['grammar', 'vocabulary']
    for (const skill of skills) {
      const oldValue = (skillProgress as any)[skill] || 0
      const newValue = Math.min(100, Math.max(0, Math.round(oldValue * 0.7 + score * 10 * 0.3)))
      ;(skillProgress as any)[skill] = newValue
      skillProgress.history.push({ skill, oldValue, newValue, source: 'homework', sourceId: homework._id })
    }
    skillProgress.lastUpdated = new Date()
    await skillProgress.save()
  }

  // Create notification for student
  await Notification.create({
    userId: homework.studentId,
    title: '📝 Homework Graded',
    message: `Your homework "${homework.title}" has been graded${score ? ` — Score: ${score}/10` : ''}. Feedback: ${feedback.substring(0, 80)}${feedback.length > 80 ? '...' : ''}`,
    type: 'homework_feedback',
    link: '/dashboard/homework',
  })

  return NextResponse.json({ success: true })
}