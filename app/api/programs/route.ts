import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Program } from '@/models/Program'
import { revalidatePath } from 'next/cache'

// GET /api/programs - PUBLIC - get all active programs
export async function GET() {
  await connectDB()
  const programs = await Program.find({ active: true }).sort({ order: 1, createdAt: 1 })
  return NextResponse.json(programs)
}

// POST /api/programs - ADMIN ONLY - create new program
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  if (!body.nameEn || !body.price) {
    return NextResponse.json({ error: 'Name and price required' }, { status: 400 })
  }
  
  await connectDB()
  const program = await Program.create(body)
  
  // Revalidate paths
  revalidatePath('/programs')
  revalidatePath('/admin/programs')
  
  return NextResponse.json(program)
}