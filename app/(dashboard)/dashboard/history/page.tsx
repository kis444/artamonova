'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, Clock, CheckCircle, XCircle, Loader2, CalendarPlus } from 'lucide-react'
import Link from 'next/link'

type Booking = {
  _id: string
  programName: string
  date: string
  time: string
  status: string
  meetLink?: string
  studentName: string
  studentId: string
}

export default function HistoryPage() {
  const { t } = useLocale()
  const { data: session } = useSession()
  const [lessons, setLessons] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    fetch('/api/student/bookings')
      .then(res => res.json())
      .then(data => {
        setLessons(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  // Filtrăm doar lecțiile din trecut (data < azi SAU status completat/anulat)
  const pastLessons = lessons
    .filter(l => {
      const lessonDate = new Date(`${l.date}T${l.time}`)
      const today = new Date()
      return lessonDate < today || l.status === 'completed' || l.status === 'cancelled'
    })
    .sort((a, b) => {
      // Sortare descrescătoare (cele mai recente primele)
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'confirmed':
        return <Badge variant="secondary">Missed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title={t.dashboard.student.lessonHistory || 'Lesson History'} />
        <main className="p-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title={t.dashboard.student.lessonHistory || 'Lesson History'} />
      <main className="p-6">
        {/* Buton pentru programare - ADAUGAT AICI */}
        <div className="mb-6 flex justify-end">
          <Button asChild size="lg" className="gap-2">
            <Link href="/booking">
              <CalendarPlus className="h-5 w-5" />
              Book a New Lesson
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">{t.dashboard.student.lessonHistory || 'Lesson History'}</CardTitle>
            <CardDescription>All your past lessons</CardDescription>
          </CardHeader>
          <CardContent>
            {pastLessons.length > 0 ? (
              <div className="space-y-4">
                {pastLessons.map((lesson) => {
                  const lessonDate = new Date(lesson.date)
                  const isMissed = lessonDate < new Date() && lesson.status === 'confirmed'
                  
                  return (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <span className="text-xs font-medium">
                            {lessonDate.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold">
                            {lessonDate.getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{lesson.programName}</p>
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lessonDate.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} at {lesson.time}
                          </p>
                        </div>
                      </div>
                      {isMissed ? (
                        <Badge variant="secondary">Missed</Badge>
                      ) : (
                        getStatusBadge(lesson.status)
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <History className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No lesson history yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/booking">Book your first lesson</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {pastLessons.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <p className="text-2xl font-bold">
                    {pastLessons.filter(l => l.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
                  <p className="text-2xl font-bold">
                    {pastLessons.filter(l => l.status === 'cancelled').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {pastLessons.filter(l => {
                      const lessonDate = new Date(`${l.date}T${l.time}`)
                      return lessonDate < new Date() && l.status === 'confirmed'
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Missed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Buton suplimentar jos - opțional */}
        {pastLessons.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/booking">
                <CalendarPlus className="h-4 w-4" />
                Book Another Lesson
              </Link>
            </Button>
          </div>
        )}
      </main>
    </>
  )
}