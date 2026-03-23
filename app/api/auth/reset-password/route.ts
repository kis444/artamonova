import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json()
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email })

    if (!user || user.resetCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    user.password = await bcrypt.hash(newPassword, 12)
    user.resetCode = undefined
    user.resetCodeExpires = undefined
    await user.save()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}