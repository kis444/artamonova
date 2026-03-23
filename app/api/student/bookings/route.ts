// app/api/student/bookings/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  
  const bookings = await Booking.find({ 
    studentId: session.user.id,
    status: { $in: ['confirmed', 'pending_payment'] }
  }).sort({ date: 1, time: 1 })

  return NextResponse.json(bookings)
}