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
  
  // Ia toate booking-urile confirmate sau plătite
  const bookings = await Booking.find({
    status: { $in: ['confirmed', 'completed'] },
    paymentStatus: 'paid'
  }).sort({ date: -1 })

  // Calculează datele pentru perioade
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Filtrează booking-urile pe perioade
  const currentMonthBookings = bookings.filter(b => {
    const bDate = new Date(b.date)
    return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear
  })

  const lastMonthBookings = bookings.filter(b => {
    const bDate = new Date(b.date)
    return bDate.getMonth() === lastMonth && bDate.getFullYear() === lastMonthYear
  })

  const yearToDateBookings = bookings.filter(b => {
    const bDate = new Date(b.date)
    return bDate.getFullYear() === currentYear
  })

  // Calculează revenue pe programe
  const programRevenue = new Map()
  bookings.forEach(b => {
    const program = b.programName
    const current = programRevenue.get(program) || { revenue: 0, lessons: 0 }
    programRevenue.set(program, {
      revenue: current.revenue + b.price,
      lessons: current.lessons + 1
    })
  })

  // Calculează procentaje
  const totalRevenue = currentMonthBookings.reduce((sum, b) => sum + b.price, 0)
  const byProgram = Array.from(programRevenue.entries())
    .map(([program, data]) => ({
      program,
      revenue: data.revenue,
      lessons: data.lessons,
      percentage: Math.round((data.revenue / totalRevenue) * 100) || 0
    }))
    .sort((a, b) => b.revenue - a.revenue)

  // Ia ultimele 5 plăți
  const recentPayments = bookings
    .slice(0, 5)
    .map(b => ({
      id: b._id.toString(),
      student: b.studentName,
      program: b.programName,
      amount: b.price,
      date: b.date
    }))

  const currentMonthRevenue = currentMonthBookings.reduce((sum, b) => sum + b.price, 0)
  const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + b.price, 0)
  const changePercent = lastMonthRevenue === 0 
    ? 100 
    : Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)

  return NextResponse.json({
    currentMonth: {
      revenue: currentMonthRevenue,
      lessons: currentMonthBookings.length,
      avgPrice: currentMonthBookings.length > 0 
        ? Math.round(currentMonthRevenue / currentMonthBookings.length) 
        : 0,
      change: changePercent
    },
    lastMonth: {
      revenue: lastMonthRevenue,
      lessons: lastMonthBookings.length,
      avgPrice: lastMonthBookings.length > 0 
        ? Math.round(lastMonthRevenue / lastMonthBookings.length) 
        : 0
    },
    yearToDate: {
      revenue: yearToDateBookings.reduce((sum, b) => sum + b.price, 0),
      lessons: yearToDateBookings.length
    },
    recentPayments,
    byProgram
  })
}