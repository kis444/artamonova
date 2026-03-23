// app/api/admin/homework-submissions/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Homework } from '@/models/Homework'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    
    const submissions = await Homework.find({})
      .populate('studentId', 'name email')
      .populate('lessonId', 'titleEn order')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}