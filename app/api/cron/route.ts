import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'
import { sendCancellationEmail, sendLessonReminder } from '@/lib/email'

// Call this endpoint every 30 min via cron (e.g. Vercel Cron or external service)
// GET /api/cron?secret=YOUR_CRON_SECRET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const now = new Date()

  // 1. Auto-cancel unpaid bookings where lesson is < 24h away
  const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const deadlineDate = deadline.toISOString().split('T')[0]
  const deadlineHour = deadline.getHours()

  const unpaidBookings = await Booking.find({
    status: 'pending_payment',
    paymentStatus: 'unpaid',
  })

  let cancelled = 0
  for (const booking of unpaidBookings) {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`)
    const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntil <= 24) {
      booking.status = 'cancelled'
      booking.cancelReason = 'Payment not received 24 hours before lesson'
      await booking.save()
      cancelled++

      try {
        await sendCancellationEmail({
          to: booking.studentEmail,
          name: booking.studentName,
          programName: booking.programName,
          date: booking.date,
          time: booking.time,
          reason: 'Payment was not received 24 hours before the lesson start time.',
        })
        if (process.env.EMAIL_USER) {
          await sendCancellationEmail({
            to: process.env.EMAIL_USER,
            name: booking.studentName,
            programName: booking.programName,
            date: booking.date,
            time: booking.time,
            reason: `Auto-cancelled: payment not received 24h before lesson.`,
          })
        }
      } catch (e) { console.error('Email error:', e) }
    }
  }

  // 2. Send 1h reminder for confirmed lessons
  const reminderTime = new Date(now.getTime() + 60 * 60 * 1000)
  const reminderDate = reminderTime.toISOString().split('T')[0]
  const reminderHour = reminderTime.getHours().toString().padStart(2, '0') + ':00'

  const upcomingLessons = await Booking.find({
    status: 'confirmed',
    date: reminderDate,
    time: reminderHour,
    reminderSent: false,
  })

  let reminders = 0
  for (const booking of upcomingLessons) {
    try {
      await sendLessonReminder({
        to: booking.studentEmail,
        name: booking.studentName,
        programName: booking.programName,
        date: booking.date,
        time: booking.time,
        meetLink: booking.meetLink,
      })
      if (process.env.EMAIL_USER) {
        await sendLessonReminder({
          to: process.env.EMAIL_USER,
          name: booking.studentName,
          programName: booking.programName,
          date: booking.date,
          time: booking.time,
          meetLink: booking.meetLink,
        })
      }
      booking.reminderSent = true
      await booking.save()
      reminders++
    } catch (e) { console.error('Reminder error:', e) }
  }

  return NextResponse.json({ cancelled, reminders })
}