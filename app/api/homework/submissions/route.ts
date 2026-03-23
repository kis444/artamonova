// app/api/homework/submissions/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { HomeworkSubmission } from '@/models/HomeworkSubmission'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  
  const submissions = await HomeworkSubmission.find({})
    .populate('studentId', 'name email')
    .populate('homeworkId', 'title')
    .sort({ submittedAt: -1 })

  return NextResponse.json(submissions)
}