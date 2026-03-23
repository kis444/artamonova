import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Timeline } from '@/models/Timeline'

export async function GET() {
  await connectDB()
  const timeline = await Timeline.find({}).sort({ order: 1, year: 1 })
  return NextResponse.json(timeline)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  await connectDB()
  const item = await Timeline.create(body)
  return NextResponse.json(item)
}