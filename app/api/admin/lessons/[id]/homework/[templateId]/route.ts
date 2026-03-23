import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { HomeworkTemplate } from '@/models/HomeworkTemplate'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId } = await params
  const body = await req.json()

  await connectDB()

  const template = await HomeworkTemplate.findByIdAndUpdate(
    templateId,
    body,
    { new: true }
  )

  if (!template) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(template)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId } = await params
  await connectDB()

  await HomeworkTemplate.findByIdAndDelete(templateId)

  return NextResponse.json({ success: true })
}