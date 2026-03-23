// app/api/programs/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Program } from '@/models/Program'

// GET - public, pentru a vedea un program
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await connectDB()
  const program = await Program.findById(id)
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 })
  }
  return NextResponse.json(program)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const program = await Program.findByIdAndUpdate(id, body, { returnDocument: 'after' })
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(program)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()
  await Program.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}