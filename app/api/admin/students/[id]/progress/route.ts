import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { SkillProgress } from '@/models/SkillProgress'
import { Homework } from '@/models/Homework'
import { Enrollment } from '@/models/Enrollment'
import { User } from '@/models/User'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()

  const student = await User.findById(id).select('-password')
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const skillProgress = await SkillProgress.findOne({ studentId: id })
  const homework = await Homework.find({ studentId: id }).sort({ createdAt: -1 })
  const enrollments = await Enrollment.find({ studentId: id }).populate('programId', 'nameEn level')

  const skills = skillProgress ? [
    { name: 'Grammar', value: skillProgress.grammar },
    { name: 'Vocabulary', value: skillProgress.vocabulary },
    { name: 'Speaking', value: skillProgress.speaking },
    { name: 'Writing', value: skillProgress.writing },
    { name: 'Listening', value: skillProgress.listening },
    { name: 'Reading', value: skillProgress.reading },
  ] : []

  const average = skills.length
    ? Math.round(skills.reduce((s, sk) => s + sk.value, 0) / skills.length)
    : 0

  let currentLevel = 'A1'
  if (average >= 85) currentLevel = 'C2'
  else if (average >= 70) currentLevel = 'C1'
  else if (average >= 50) currentLevel = 'B2'
  else if (average >= 30) currentLevel = 'B1'
  else if (average >= 15) currentLevel = 'A2'

  return NextResponse.json({
    student,
    skills,
    average,
    currentLevel,
    homework,
    enrollments,
    history: skillProgress?.history?.slice(-20).reverse() || [],
  })
}