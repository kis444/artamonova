import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { SkillProgress } from '@/models/SkillProgress'
import { Program } from '@/models/Program'
import { User } from '@/models/User'
import { Homework } from '@/models/Homework'
import { LessonProgress } from '@/models/LessonProgress'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const studentId = (session.user as any).id
  const student = await User.findById(studentId)
  const level = student?.level || 'A1'

  // Găsește programul studentului
  const program = await Program.findOne({ 
    level: { $regex: new RegExp(`^${level}`, 'i') }, 
    active: true 
  })

  let skillProgress = await SkillProgress.findOne({ studentId })
  
  if (!skillProgress) {
    skillProgress = {
      grammar: 5,
      vocabulary: 5,
      speaking: 5,
      writing: 5,
      listening: 5,
      reading: 5,
    }
  }

  // Obține temele recente (gradate)
  const recentHomework = await Homework.find({ 
    studentId,
    status: 'graded'
  })
  .sort({ gradedAt: -1 })
  .limit(5)
  .select('title score feedback gradedAt')
  .lean()

  // Obține evaluările recente ale lecțiilor
  const recentEvaluations = await LessonProgress.find({
    studentId,
    teacherEvaluatedAt: { $ne: null }
  })
  .sort({ teacherEvaluatedAt: -1 })
  .limit(5)
  .populate('lessonId', 'titleEn')
  .lean()

  const skills = [
    { name: 'Grammar', value: skillProgress.grammar || 0 },
    { name: 'Vocabulary', value: skillProgress.vocabulary || 0 },
    { name: 'Speaking', value: skillProgress.speaking || 0 },
    { name: 'Writing', value: skillProgress.writing || 0 },
    { name: 'Listening', value: skillProgress.listening || 0 },
    { name: 'Reading', value: skillProgress.reading || 0 },
  ]

  const average = Math.round(
    (skills[0].value + skills[1].value + skills[2].value + 
     skills[3].value + skills[4].value + skills[5].value) / 6
  )

  let currentLevel = 'A1'
  if (average >= 85) currentLevel = 'C2'
  else if (average >= 70) currentLevel = 'C1'
  else if (average >= 50) currentLevel = 'B2'
  else if (average >= 30) currentLevel = 'B1'
  else if (average >= 15) currentLevel = 'A2'

  return NextResponse.json({
    skills,
    currentLevel,
    average,
    recentHomework: recentHomework.map(h => ({
      _id: h._id,
      title: h.title,
      score: h.score,
      feedback: h.feedback,
      gradedAt: h.gradedAt
    })),
    recentEvaluations: recentEvaluations.map(e => ({
      _id: e._id,
      lessonId: { title: (e.lessonId as any)?.titleEn || 'Lesson' },
      teacherScore: e.teacherScore,
      teacherFeedback: e.teacherFeedback,
      teacherEvaluatedAt: e.teacherEvaluatedAt
    })),
    stats: {
      grammar: skillProgress.grammar || 0,
      vocabulary: skillProgress.vocabulary || 0,
      speaking: skillProgress.speaking || 0,
      writing: skillProgress.writing || 0,
      listening: skillProgress.listening || 0,
      reading: skillProgress.reading || 0
    }
  })
}
