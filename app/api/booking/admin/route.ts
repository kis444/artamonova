// app/api/booking/admin/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  await connectDB()
  
  const bookings = await Booking.find({})
    .populate({
      path: 'studentId',
      select: 'name email permanentMeetLink'
    })
    .populate('programId', 'nameEn')
    .sort({ date: 1, time: 1 })

  // Transformă datele pentru frontend
  const formattedBookings = bookings.map(booking => ({
    _id: booking._id,
    studentId: booking.studentId,
    studentName: booking.studentId?.name || booking.studentName,
    studentEmail: booking.studentId?.email || booking.studentEmail,
    programName: booking.programId?.nameEn || booking.programName,
    date: booking.date,
    time: booking.time,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    meetLink: booking.meetLink,
    price: booking.price,
    duration: booking.duration,
    createdAt: booking.createdAt,
  }))

  return NextResponse.json(formattedBookings)
}