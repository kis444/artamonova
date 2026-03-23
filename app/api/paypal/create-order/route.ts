import { NextResponse } from 'next/server'
import { auth } from '@/auth'
// @ts-ignore
import paypal from '@paypal/checkout-server-sdk'

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

  const { amount, bookingId, description } = await req.json()

  const request = new paypal.orders.OrdersCreateRequest()
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'EUR',
        value: amount.toString(),
      },
      description: description || 'English Lesson',
      custom_id: bookingId,
    }],
    application_context: {
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking`,
      brand_name: 'ARTAMONOVA English',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
    },
  })

  try {
    const response: any = await client.execute(request)
    return NextResponse.json({ orderId: response.result.id })
  } catch (error) {
    console.error('PayPal error:', error)
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 })
  }
}