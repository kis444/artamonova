import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { HomeworkSubmission } from '@/models/HomeworkSubmission'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { textSubmission, fileUrl, fileName } = await req.json()

  await connectDB()

  const submission = await HomeworkSubmission.findById(id)
  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (submission.studentId.toString() !== (session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (textSubmission) submission.textSubmission = textSubmission
  if (fileUrl) {
    submission.fileUrl = fileUrl
    submission.fileName = fileName
  }
  submission.status = 'submitted'
  submission.submittedAt = new Date()
  await submission.save()

  return NextResponse.json({ success: true })
}