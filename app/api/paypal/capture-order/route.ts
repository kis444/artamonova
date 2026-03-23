import { NextResponse } from 'next/server'
import { auth } from '@/auth'
// @ts-ignore
import paypal from '@paypal/checkout-server-sdk'
import { connectDB } from '@/lib/mongodb'
import { Booking } from '@/models/Booking'

const environment = new paypal.core.SandboxEnvironment(
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!
)
const client = new paypal.core.PayPalHttpClient(environment)

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await req.json()

  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.requestBody({})

  try {
    const response: any = await client.execute(request)
    const capture = response.result?.purchase_units?.[0]?.payments?.captures?.[0]
    const customId = response.result?.purchase_units?.[0]?.custom_id

    let meetLink = ''

    if (customId) {
      await connectDB()
      
      // Actualizează booking-ul
      const booking = await Booking.findByIdAndUpdate(
        customId,
        {
          paymentStatus: 'paid',
          paymentMethod: 'paypal',
          transactionId: capture?.id,
          status: 'confirmed',
        },
        { new: true }
      ).populate('studentId', 'name email')

      // Generează Google Meet link
      if (booking && booking.date && booking.time && booking.studentId) {
        try {
          const meetResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/meet/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startTime: new Date(`${booking.date}T${booking.time}`).toISOString(),
              endTime: new Date(`${booking.date}T${booking.time}`).toISOString(),
              studentEmail: booking.studentId.email,
              studentName: booking.studentId.name,
              lessonTitle: booking.programName,
            }),
          })

          const meetData = await meetResponse.json()
          
          if (meetData.success) {
            meetLink = meetData.meetLink
            // Salvează meetLink în booking
            await Booking.findByIdAndUpdate(customId, {
              meetLink: meetData.meetLink,
            })
          } else {
            console.error('Failed to create Meet:', meetData.error)
          }
        } catch (meetError) {
          console.error('Meet creation error:', meetError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: capture?.id,
      status: capture?.status,
      meetLink: meetLink || 'https://meet.google.com/your-meet-link',
    })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'Payment capture failed' }, { status: 500 })
  }
}