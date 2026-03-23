import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { PlacementQuestion } from '@/models/PlacementQuestion'

export async function GET() {
  await connectDB()
  const questions = await PlacementQuestion.find({ active: true }).sort({ order: 1, createdAt: 1 })
  return NextResponse.json(questions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  if (!body.question || !body.options || body.options.length < 2 || body.correctAnswer === undefined || !body.level) {
    return NextResponse.json({ error: 'question, options, correctAnswer, level required' }, { status: 400 })
  }
  await connectDB()
  const count = await PlacementQuestion.countDocuments()
  const q = await PlacementQuestion.create({ ...body, order: body.order ?? count })
  return NextResponse.json(q)
}