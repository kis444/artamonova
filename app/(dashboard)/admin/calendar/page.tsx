'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Clock, Video, ChevronLeft, ChevronRight, Lock, Trash2, Loader2 } from 'lucide-react'

type Booking = {
  _id: string
  studentName: string
  studentId?: { _id: string; name: string; email: string; permanentMeetLink?: string }
  programName: string
  date: string
  time: string
  status: string
  meetLink: string
  paymentStatus: string
}

type Freeze = { _id: string; date: string; startTime: string; endTime: string; reason: string }

export default function AdminCalendarPage() {
  const { t, locale } = useLocale()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [freezes, setFreezes] = useState<Freeze[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Freeze form
  const [freezeDate, setFreezeDate] = useState('')
  const [freezeStart, setFreezeStart] = useState('10:00')
  const [freezeEnd, setFreezeEnd] = useState('12:00')
  const [freezeReason, setFreezeReason] = useState('')
  const [freezeLoading, setFreezeLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/booking/admin').then((r) => r.json()),
      fetch('/api/freeze').then((r) => r.json()),
    ]).then(([b, f]) => {
      setBookings(Array.isArray(b) ? b : [])
      setFreezes(Array.isArray(f) ? f : [])
      setLoading(false)
    })
  }, [])

  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const dayBookings = bookings.filter((b) => b.date === selectedDateStr)
  const dayFreezes = freezes.filter((f) => f.date === selectedDateStr)

  const getMeetLinkForBooking = (booking: Booking) => {
    // Prioritize: student's permanent link > booking specific link
    if (booking.studentId?.permanentMeetLink) {
      return booking.studentId.permanentMeetLink
    }
    if (booking.meetLink) {
      return booking.meetLink
    }
    return null
  }

  const getWeekDays = (date: Date) => {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay() + 1)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); return d
    })
  }
  const weekDays = getWeekDays(selectedDate)

  async function handleAddFreeze() {
    setFreezeLoading(true)
    const res = await fetch('/api/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: freezeDate, startTime: freezeStart, endTime: freezeEnd, reason: freezeReason }),
    })
    const data = await res.json()
    if (res.ok) {
      setFreezes((prev) => [...prev, data])
      setDialogOpen(false)
      setFreezeDate(''); setFreezeReason('')
    }
    setFreezeLoading(false)
  }

  async function handleDeleteFreeze(id: string) {
    await fetch('/api/freeze', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFreezes((prev) => prev.filter((f) => f._id !== id))
  }

  const statusColor = (status: string) => {
    if (status === 'confirmed') return 'default'
    if (status === 'pending_payment') return 'secondary'
    if (status === 'cancelled') return 'destructive'
    return 'outline'
  }

  return (
    <>
      <DashboardHeader title={t.dashboard.admin.calendar} />
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => {
              const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d)
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-serif text-xl font-semibold">
              {selectedDate.toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'ro' ? 'ro-RO' : 'en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => {
              const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d)
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Lock className="mr-2 h-4 w-4" />
                Block Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Time Slot</DialogTitle>
                <DialogDescription>Students won't be able to book during this time</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={freezeDate} onChange={(e) => setFreezeDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select value={freezeStart} onValueChange={setFreezeStart}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`).map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select value={freezeEnd} onValueChange={setFreezeEnd}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => `${(10 + i).toString().padStart(2, '0')}:00`).map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Input placeholder="e.g., Doctor appointment, Holiday" value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddFreeze} disabled={!freezeDate || freezeLoading}>
                  {freezeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Block Time
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            {/* Week view */}
            <Card>
              <CardHeader><CardTitle className="font-serif">Week View</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const ds = day.toISOString().split('T')[0]
                    const dl = bookings.filter((b) => b.date === ds)
                    const fl = freezes.filter((f) => f.date === ds)
                    const isToday = ds === new Date().toISOString().split('T')[0]
                    const isSelected = ds === selectedDateStr
                    return (
                      <div
                        key={ds}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-30] cursor-pointer rounded-lg border p-2 transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        } ${isToday ? 'ring-2 ring-primary' : ''}`}
                      >
                        <p className="text-center text-xs font-medium text-muted-foreground">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className={`text-center text-lg font-bold mb-1 ${isToday ? 'text-primary' : ''}`}>
                          {day.getDate()}
                        </p>
                        <div className="space-y-1">
                          {dl.map((b) => (
                            <div key={b._id} className="rounded bg-primary/10 px-1 py-0.5 text-xs truncate">
                              {b.time} {b.studentName.split(' ')[0]}
                            </div>
                          ))}
                          {fl.map((f) => (
                            <div key={f._id} className="rounded bg-destructive/10 px-1 py-0.5 text-xs truncate">
                              🔒 {f.startTime}–{f.endTime}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Day detail */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    {dayFreezes.map((f) => (
                      <div key={f._id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <div className="flex items-center gap-3">
                          <Lock className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="font-medium text-destructive">Blocked: {f.startTime} – {f.endTime}</p>
                            {f.reason && <p className="text-sm text-muted-foreground">{f.reason}</p>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFreeze(f._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    {dayBookings.map((b) => {
                      const meetLink = getMeetLinkForBooking(b)
                      return (
                        <div key={b._id} className="flex items-center justify-between rounded-lg border border-border p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                              {b.studentName.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{b.studentName}</p>
                              <p className="text-sm text-muted-foreground">{b.programName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" /> {b.time}
                              </p>
                              <div className="flex gap-1 mt-1">
                                <Badge variant={statusColor(b.status)} className="text-xs">{b.status}</Badge>
                                <Badge variant={b.paymentStatus === 'paid' ? 'default' : 'destructive'} className="text-xs">
                                  {b.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                            {meetLink ? (
                              <Button size="sm" asChild>
                                <a href={meetLink} target="_blank" rel="noopener noreferrer">
                                  <Video className="mr-1 h-3 w-3" /> Join
                                </a>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <Video className="mr-1 h-3 w-3" /> No Link
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {dayBookings.length === 0 && dayFreezes.length === 0 && (
                      <p className="py-6 text-center text-muted-foreground">No lessons or blocks for this day</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}