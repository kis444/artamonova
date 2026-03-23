import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Notification } from '@/models/Notification'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const userId = (session.user as any).id
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30)

  const unreadCount = await Notification.countDocuments({ userId, read: false })
  return NextResponse.json({ notifications, unreadCount })
}

// Mark all as read
export async function PATCH() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const userId = (session.user as any).id
  await Notification.updateMany({ userId, read: false }, { read: true })
  return NextResponse.json({ success: true })
}