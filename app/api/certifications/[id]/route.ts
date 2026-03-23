import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Certification } from '@/models/Certification'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const cert = await Certification.findByIdAndUpdate(id, body, { returnDocument: 'after' })
  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cert)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()
  await Certification.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}