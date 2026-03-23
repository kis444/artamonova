import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, phone } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  await connectDB()
  const userId = (session.user as any).id
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone: phone || '' },
    { new: true }  // Asigură-te că returnează documentul actualizat
  ).select('-password')

  // Returnează direct user-ul, nu sub cheia 'user'
  return NextResponse.json({
    name: user.name,
    phone: user.phone,
    email: user.email,
  })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById((session.user as any).id).select('-password -resetCode -resetCodeExpires')
  return NextResponse.json({
    name: user.name,
    phone: user.phone,
    email: user.email,
  })
}