import { ContentProvider } from '@/lib/useContent'
import { LocaleProvider } from '@/lib/locale-context'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PayPalProvider } from '@/app/providers/paypal-provider'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LocaleProvider>
      <ContentProvider>
        <PayPalProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </PayPalProvider>
      </ContentProvider>
    </LocaleProvider>
  )
}