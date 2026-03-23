import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Enrollment } from '@/models/Enrollment'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const students = await User.find({ role: 'student' })
    .select('-password -resetCode -resetCodeExpires')
    .sort({ createdAt: -1 })

  return NextResponse.json(students)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, phone, password, level, program } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 })
  }

  await connectDB()
  const existing = await User.findOne({ email })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const student = await User.create({
    name, email, phone: phone || '', password: hashed,
    level: level || '', program: program || '',
    role: 'student', status: 'active',
  })

  const { password: _, ...studentData } = student.toObject()
  return NextResponse.json(studentData)
}