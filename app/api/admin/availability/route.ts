import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Availability } from '@/models/Availability'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const availability = await Availability.find({}).sort({ dayOfWeek: 1 })
  return NextResponse.json(availability)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { days } = await req.json()
  // days: [{ dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }]
  if (!Array.isArray(days)) {
    return NextResponse.json({ error: 'days array required' }, { status: 400 })
  }

  await connectDB()

  // Upsert each day
  for (const day of days) {
    await Availability.findOneAndUpdate(
      { dayOfWeek: day.dayOfWeek },
      { startTime: day.startTime, endTime: day.endTime, isActive: day.isActive },
      { upsert: true, new: true }
    )
  }

  return NextResponse.json({ success: true })
}