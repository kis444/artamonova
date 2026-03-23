import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { SkillProgress } from '@/models/SkillProgress'
import { Enrollment } from '@/models/Enrollment'
import { Homework } from '@/models/Homework'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const students = await User.find({ role: 'student', status: 'active' }).select('-password')

  const rows: string[] = [
    'Name,Email,Phone,Level,Grammar,Vocabulary,Speaking,Writing,Listening,Reading,Average,Programs,Homework Done,Joined',
  ]

  for (const student of students) {
    const sp = await SkillProgress.findOne({ studentId: student._id })
    const enrollments = await Enrollment.find({ studentId: student._id })
    const hwDone = await Homework.countDocuments({ studentId: student._id, status: { $in: ['graded', 'auto_graded', 'submitted'] } })

    const grammar = sp?.grammar || 0
    const vocabulary = sp?.vocabulary || 0
    const speaking = sp?.speaking || 0
    const writing = sp?.writing || 0
    const listening = sp?.listening || 0
    const reading = sp?.reading || 0
    const avg = sp ? Math.round((grammar + vocabulary + speaking + writing + listening + reading) / 6) : 0

    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`

    rows.push([
      esc(student.name),
      esc(student.email),
      esc(student.phone || ''),
      esc(student.level || ''),
      grammar, vocabulary, speaking, writing, listening, reading, avg,
      enrollments.length,
      hwDone,
      esc(new Date(student.createdAt).toLocaleDateString()),
    ].join(','))
  }

  const csv = rows.join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="students-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
