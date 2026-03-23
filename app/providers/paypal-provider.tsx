// app/providers/paypal-provider.tsx
'use client'

import { PayPalScriptProvider } from "@paypal/react-paypal-js"

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "EUR",
        intent: "capture",
        components: "buttons",
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
}