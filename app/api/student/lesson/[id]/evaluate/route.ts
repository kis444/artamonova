import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { SkillProgress } from '@/models/SkillProgress'
import { Course } from '@/models/Course'
import { User } from '@/models/User'

const SKILLS = ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading'] as const
type Skill = typeof SKILLS[number]

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { studentId, skillScores, feedback } = await req.json()

    if (!studentId || !skillScores) {
      return NextResponse.json({ error: 'studentId and skillScores required' }, { status: 400 })
    }

    await connectDB()

    // Get student and their course for level limits
    const student = await User.findById(studentId)
    const course = await Course.findOne({ level: student?.level || 'A1', active: true })
    const maxLevel = course?.levelRange?.max || 100

    // Get or create SkillProgress
    let skillProgress = await SkillProgress.findOne({ studentId })
    if (!skillProgress) {
      skillProgress = await SkillProgress.create({
        studentId,
        grammar: 5,
        vocabulary: 5,
        speaking: 5,
        writing: 5,
        listening: 5,
        reading: 5,
        history: [],
      })
    }

    // Apply moving average: 70% old + 30% new, with course level limit
    const historyEntries = []
    for (const [skill, score] of Object.entries(skillScores)) {
      if (!SKILLS.includes(skill as Skill)) continue
      const s = skill as Skill
      const oldValue = (skillProgress as any)[s] || 0
      const scoreAs100 = Number(score) * 10 // 1-10 → 10-100
      let newValue = Math.round(oldValue * 0.7 + scoreAs100 * 0.3)
      
      // LIMITARE LA NIVELUL CURSULUI
      newValue = Math.min(newValue, maxLevel)
      newValue = Math.min(100, Math.max(0, newValue))
      
      ;(skillProgress as any)[s] = newValue
      historyEntries.push({
        skill: s,
        oldValue,
        newValue,
        source: 'lesson_evaluation',
        sourceId: null,
      })
    }

    skillProgress.history.push(...historyEntries)
    skillProgress.lastUpdated = new Date()
    await skillProgress.save()

    return NextResponse.json({ success: true, skillProgress })

  } catch (error) {
    console.error('EVALUATE ERROR:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}