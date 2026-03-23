import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Content } from '@/models/Content'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  await connectDB()

  if (key) {
    const item = await Content.findOne({ key })
    return NextResponse.json({ value: item?.value ?? null })
  }

  const all = await Content.find({})
  const result: Record<string, string> = {}
  for (const item of all) {
    result[item.key] = item.value
  }
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key, value } = await req.json()
  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key and value required' }, { status: 400 })
  }

  await connectDB()
  await Content.findOneAndUpdate(
    { key },
    { value, updatedAt: new Date() },
    { upsert: true }
  )

  return NextResponse.json({ success: true })
}