import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Freeze } from '@/models/Freeze'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  await connectDB()
  const freezes = date
    ? await Freeze.find({ date })
    : await Freeze.find({})
  return NextResponse.json(freezes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { date, startTime, endTime, reason } = await req.json()
  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  await connectDB()
  const freeze = await Freeze.create({ date, startTime, endTime, reason })
  return NextResponse.json(freeze)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  await connectDB()
  await Freeze.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}