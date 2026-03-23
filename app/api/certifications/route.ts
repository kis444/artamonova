import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Certification } from '@/models/Certification'

export async function GET() {
  await connectDB()
  const certs = await Certification.find({}).sort({ order: 1, createdAt: 1 })
  return NextResponse.json(certs)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  console.log('Received body:', body)
  
  if (!body.titleEn || !body.issuer) {
    return NextResponse.json({ error: 'Title and issuer required' }, { status: 400 })
  }
  
  await connectDB()
  
  const cert = await Certification.create({
    titleEn: body.titleEn,
    titleRo: body.titleRo || '',
    titleRu: body.titleRu || '',
    issuer: body.issuer,
    year: body.year || '',
    pdfUrl: body.pdfUrl || '',
    imageUrl: body.imageUrl || '',
    order: body.order || 0,
    active: true,
  })
  
  return NextResponse.json(cert)
}
