import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Homework } from '@/models/Homework'

// GET /api/homework - get all homework (admin only)
export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  
  const homework = await Homework.find({})
    .sort({ createdAt: -1 })

  return NextResponse.json(homework)
}