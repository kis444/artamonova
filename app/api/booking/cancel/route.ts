import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'
import { sendCancellationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId, reason } = await req.json()
  await connectDB()

  const booking = await Booking.findById(bookingId)
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  booking.status = 'cancelled'
  booking.cancelReason = reason || 'Cancelled'
  await booking.save()

  try {
    await sendCancellationEmail({
      to: booking.studentEmail,
      name: booking.studentName,
      programName: booking.programName,
      date: booking.date,
      time: booking.time,
      reason: reason || 'Cancelled by request',
    })
    if (process.env.EMAIL_USER) {
      await sendCancellationEmail({
        to: process.env.EMAIL_USER,
        name: booking.studentName,
        programName: booking.programName,
        date: booking.date,
        time: booking.time,
        reason: reason || 'Cancelled by request',
      })
    }
  } catch (e) { console.error('Email error:', e) }

  return NextResponse.json({ success: true })
}