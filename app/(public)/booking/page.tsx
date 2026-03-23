'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@/lib/locale-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Clock, CreditCard, CheckCircle, Loader2, Video, Clock3 } from 'lucide-react'
import { PayPalButtons } from "@paypal/react-paypal-js"
import Link from 'next/link'

type Slot = { time: string; available: boolean; frozen: boolean }
type Program = { _id: string; nameEn: string; nameRo: string; nameRu: string; price: number }
type Step = 1 | 2 | 3 | 4

export default function BookingPage() {
  const { locale, t } = useLocale()
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const programFromUrl = searchParams.get('program')

  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [bookingId, setBookingId] = useState('')
  const [meetLink, setMeetLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [programsLoading, setProgramsLoading] = useState(true)

  // Load programs
  useEffect(() => {
    fetch('/api/programs', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setPrograms(Array.isArray(data) ? data : [])
        setProgramsLoading(false)
      })
      .catch(() => setProgramsLoading(false))
  }, [])

  // Set program from URL
  useEffect(() => {
    if (programFromUrl && programs.length > 0) {
      setSelectedProgram(programFromUrl)
    }
  }, [programFromUrl, programs])

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDate) return
    setSlotsLoading(true)
    const dateStr = selectedDate.toISOString().split('T')[0]
    fetch(`/api/availability?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => { setSlots(data.slots || []); setSlotsLoading(false) })
      .catch(() => setSlotsLoading(false))
  }, [selectedDate])

  const selectedProgramData = programs.find((p) => p._id === selectedProgram)
  const canProceed = selectedDate && selectedTime && selectedProgram

  async function handleBook() {
    if (!session) { router.push('/login'); return }
    setLoading(true)
    setError('')
    const dateStr = selectedDate!.toISOString().split('T')[0]
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId: selectedProgram, date: dateStr, time: selectedTime }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Something went wrong'); return }
    setBookingId(data.bookingId)
    setStep(2)
  }

  async function handlePayLater() {
    setLoading(true)
    setError('')
    setStep(3)
    setLoading(false)
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20">
        <h2 className="font-serif text-2xl font-bold">Login to book a lesson</h2>
        <p className="text-muted-foreground">You need an account to book lessons.</p>
        <div className="flex gap-3">
          <Button asChild><Link href="/login">Log In</Link></Button>
          <Button variant="outline" asChild><Link href="/register">Register</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <section className="container mx-auto mb-12 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold">{t.booking.title}</h1>
          <p className="text-lg text-muted-foreground">{t.booking.subtitle}</p>
        </div>
      </section>

      {/* Progress */}
      <section className="container mx-auto mb-8 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  step > s ? 'bg-primary text-primary-foreground' :
                  step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`mx-2 h-1 w-24 md:w-40 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Select Slot</span>
            <span>Payment</span>
            <span>Confirmed</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">

          {/* STEP 1: Select slot */}
          {step === 1 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    {t.booking.selectDate}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime('') }}
                    disabled={(date) => date < new Date()}
                    className="rounded-2xl border"
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Clock className="h-5 w-5 text-primary" />
                      {t.booking.selectTime}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedDate ? (
                      <p className="text-sm text-muted-foreground">Select a date first</p>
                    ) : slotsLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading slots...</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No available slots on this day</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? 'default' : 'outline'}
                            size="sm"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={slot.frozen ? 'opacity-40' : ''}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Select Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {programsLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading programs...</span>
                      </div>
                    ) : (
                      <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((p) => {
                            const name = locale === 'ro' ? p.nameRo || p.nameEn : 
                                        locale === 'ru' ? p.nameRu || p.nameEn : p.nameEn
                            return (
                              <SelectItem key={p._id} value={p._id}>
                                {name} — €{p.price}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* Summary */}
                {canProceed && selectedProgramData && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Program</span>
                        <span className="font-medium">
                          {locale === 'ro' ? selectedProgramData.nameRo || selectedProgramData.nameEn :
                           locale === 'ru' ? selectedProgramData.nameRu || selectedProgramData.nameEn :
                           selectedProgramData.nameEn}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{selectedDate?.toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-serif text-lg font-bold text-primary">€{selectedProgramData.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

                <Button className="w-full" disabled={!canProceed || loading} onClick={handleBook}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment with PayPal */}
          {step === 2 && selectedProgramData && bookingId && (
            <div className="mx-auto max-w-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Secure Payment
                  </CardTitle>
                  <CardDescription>Pay securely with PayPal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-medium">
                        {locale === 'ro' ? selectedProgramData.nameRo || selectedProgramData.nameEn :
                         locale === 'ru' ? selectedProgramData.nameRu || selectedProgramData.nameEn :
                         selectedProgramData.nameEn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString('en-GB')} at {selectedTime}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-serif text-xl font-bold text-primary">€{selectedProgramData.price}</span>
                    </div>
                  </div>

                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                    createOrder={async () => {
                      const res = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          amount: selectedProgramData.price,
                          bookingId: bookingId,
                          description: `${selectedProgramData.nameEn} Lesson on ${selectedDate?.toLocaleDateString()} at ${selectedTime}`,
                        }),
                      })
                      const data = await res.json()
                      return data.orderId
                    }}
                    onApprove={async (data) => {
                      const res = await fetch('/api/paypal/capture-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: data.orderID }),
                      })
                      const result = await res.json()
                      if (result.success) {
                        setMeetLink(result.meetLink || '')
                        setStep(3)
                      } else {
                        setError('Payment failed. Please try again.')
                      }
                    }}
                    onError={(err) => {
                      console.error('PayPal error:', err)
                      setError('Payment failed. Please try again.')
                    }}
                  />

                  <p className="rounded-md bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    ⚠️ Payment must be completed at least 24 hours before your lesson. Unpaid lessons are automatically cancelled.
                  </p>

                  {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

                  <div className="flex flex-col gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                      Back
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={handlePayLater} 
                      disabled={loading}
                      className="text-muted-foreground hover:text-foreground w-full"
                    >
                      <Clock3 className="mr-2 h-4 w-4" />
                      I'll pay later
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: Confirmed */}
          {step === 3 && (
            <div className="mx-auto max-w-lg text-center">
              <Card>
                <CardContent className="pt-8 pb-8 space-y-6">
                  <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground">
                      {meetLink ? (
                        <>Payment received! A confirmation email has been sent to <strong>{session?.user?.email}</strong></>
                      ) : (
                        <>Your lesson is booked! You can pay later from your dashboard. A reminder will be sent before the lesson.</>
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-medium">
                        {selectedProgramData && (locale === 'ro' ? selectedProgramData.nameRo || selectedProgramData.nameEn :
                         locale === 'ru' ? selectedProgramData.nameRu || selectedProgramData.nameEn :
                         selectedProgramData.nameEn)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString('en-GB')} at {selectedTime}</span>
                    </div>
                    {!meetLink && (
                      <div className="flex justify-between border-t pt-2 text-amber-600">
                        <span>Payment Status</span>
                        <span className="font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                  {meetLink && (
                    <Button asChild className="w-full">
                      <a href={meetLink} target="_blank" rel="noopener noreferrer">
                        <Video className="mr-2 h-4 w-4" />
                        Join Google Meet
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}