import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'
import { Freeze } from '@/models/Freeze'
import { Availability } from '@/models/Availability'

// GET /api/availability?date=2026-03-25
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  await connectDB()

  const dayOfWeek = new Date(date).getDay()

  // Check if this day is active
  const availability = await Availability.findOne({ dayOfWeek })

  // Default working hours if not set
  const startHour = availability?.startTime ? parseInt(availability.startTime) : 9
  const endHour = availability?.endTime ? parseInt(availability.endTime) : 18
  const isActiveDay = availability ? availability.isActive : (dayOfWeek >= 1 && dayOfWeek <= 5)

  if (!isActiveDay) {
    return NextResponse.json({ slots: [] })
  }

  // Get existing bookings for this date
  const bookings = await Booking.find({
    date,
    status: { $in: ['confirmed', 'pending_payment'] },
  })
  const bookedTimes = bookings.map((b) => b.time)

  // Get freezes for this date
  const freezes = await Freeze.find({ date })

  // Generate slots
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`

    // Check if frozen
    const isFrozen = freezes.some((f) => {
      const fStart = parseInt(f.startTime)
      const fEnd = parseInt(f.endTime)
      return hour >= fStart && hour < fEnd
    })

    slots.push({
      time,
      available: !bookedTimes.includes(time) && !isFrozen,
      frozen: isFrozen,
    })
  }

  return NextResponse.json({ slots })
}