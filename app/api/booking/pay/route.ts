import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

  await connectDB()
  const booking = await Booking.findById(bookingId)
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  booking.status = 'confirmed'
  booking.paymentStatus = 'paid'
  await booking.save()

  const emailData = {
    name: booking.studentName,
    programName: booking.programName,
    date: booking.date,
    time: booking.time,
    meetLink: booking.meetLink,
    price: booking.price,
  }

  try {
    await sendBookingConfirmation({ to: booking.studentEmail, ...emailData })
    if (process.env.EMAIL_USER) {
      await sendBookingConfirmation({ to: process.env.EMAIL_USER, ...emailData, isAdmin: true })
    }
  } catch (e) { console.error('Email error:', e) }

  return NextResponse.json({ success: true, meetLink: booking.meetLink })
}