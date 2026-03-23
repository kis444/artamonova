import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'
import { Program } from '@/models/Program'
import { LessonTemplate } from '@/models/LessonTemplate'
import { LessonProgress } from '@/models/LessonProgress'
import { HomeworkTemplate } from '@/models/HomeworkTemplate'
import { Homework } from '@/models/Homework'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { programId, date, time } = await req.json()
  if (!programId || !date || !time) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await connectDB()

  const program = await Program.findById(programId)
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 })
  }

  // Check slot is still available
  const existing = await Booking.findOne({
    date,
    time,
    status: { $in: ['confirmed', 'pending_payment'] },
  })
  if (existing) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
  }

  const booking = await Booking.create({
    studentId: (session.user as any).id,
    studentName: session.user?.name || '',
    studentEmail: session.user?.email || '',
    programId,
    programName: program.nameEn,
    date,
    time,
    price: program.price,
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    meetLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`,
  })

  // ============================================
  // SISTEM DE DEBLOCARE LECȚII
  // ============================================
  
  const existingBookings = await Booking.countDocuments({
    studentId: (session.user as any).id,
    programId,
    status: { $in: ['confirmed', 'pending_payment', 'completed'] }
  })
  
  const lessonNumber = existingBookings + 1

  const lessonTemplate = await LessonTemplate.findOne({
    programId,
    lessonNumber
  })

  if (lessonTemplate) {
    // Verifică dacă LessonProgress există deja
    const existingProgress = await LessonProgress.findOne({
      studentId: (session.user as any).id,
      programId,
      lessonNumber
    })

    if (!existingProgress) {
      const scheduledDateTime = new Date(`${date}T${time}`)
      
      await LessonProgress.create({
        studentId: (session.user as any).id,
        programId,
        lessonNumber,
        scheduledDate: scheduledDateTime,
        isUnlocked: true,
        unlockedAt: new Date(),
        status: 'available'
      })

      const homeworkTemplates = await HomeworkTemplate.find({ 
        lessonId: lessonTemplate._id, 
        active: true 
      }).sort({ order: 1 })
      
      for (const template of homeworkTemplates) {
        const dueDate = new Date(scheduledDateTime)
        dueDate.setDate(dueDate.getDate() + template.dueDaysAfterUnlock)
        
        await Homework.create({
          studentId: (session.user as any).id,
          studentName: session.user?.name || '',
          title: template.title,
          description: template.description || '',
          dueDate: dueDate.toISOString().split('T')[0],
          type: template.type,
          status: 'pending',
          lessonId: lessonTemplate._id
        })
      }
    }
  }

  try {
    await sendBookingConfirmation({
      to: session.user?.email || '',
      name: session.user?.name || '',
      programName: program.nameEn,
      date,
      time,
      meetLink: booking.meetLink,
      price: program.price,
    })
  } catch (error) {
    console.error('Email error:', error)
  }

  return NextResponse.json({ bookingId: booking._id.toString(), price: program.price })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const bookings = await Booking.find({
    studentId: (session.user as any).id,
  }).sort({ date: 1, time: 1 })

  return NextResponse.json(bookings)
}
