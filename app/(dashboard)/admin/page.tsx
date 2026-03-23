'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, DollarSign, TrendingUp, Clock, ArrowRight, Video, Loader2 } from 'lucide-react'

type Student = {
  _id: string; name: string; email: string
  level: string; program: string; createdAt: string
}

type Booking = {
  _id: string; studentName: string; studentId?: { _id: string; name: string; email: string; permanentMeetLink?: string }
  programName: string
  date: string; time: string; status: string; meetLink: string
}

export default function AdminDashboard() {
  const { t } = useLocale()
  const [students, setStudents] = useState<Student[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/booking/admin').then(r => r.json()),
      fetch('/api/students').then(r => r.json()),
    ]).then(([bookingData, studentData]) => {
      setBookings(Array.isArray(bookingData) ? bookingData : [])
      setStudents(Array.isArray(studentData) ? studentData.filter((s: any) => s.status !== 'inactive') : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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

  const today = new Date().toISOString().split('T')[0]
  const todayLessons = bookings.filter(
    l => l.date === today && (l.status === 'confirmed' || l.status === 'pending_payment')
  )

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthBookings = bookings.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const monthlyStats = {
    totalLessons: monthBookings.length,
    revenue: monthBookings.filter(b => b.status === 'confirmed').length * 45,
    avgPrice: 45,
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title={t.dashboard.admin.title} />
        <main className="p-6 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title={t.dashboard.admin.title} />
      <main className="p-6">
        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{monthlyStats.totalLessons}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.admin.totalLessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">€{monthlyStats.revenue}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.admin.monthlyRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">€{monthlyStats.avgPrice}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.admin.avgPrice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Today's Lessons</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/calendar">View Calendar <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {todayLessons.length > 0 ? (
                  <div className="space-y-4">
                    {todayLessons.map((lesson) => {
                      const meetLink = getMeetLinkForBooking(lesson)
                      return (
                        <div key={lesson._id} className="flex items-center justify-between rounded-lg border border-border p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                              {lesson.studentName?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                            </div>
                            <div>
                              <p className="font-medium">{lesson.studentName}</p>
                              <p className="text-sm text-muted-foreground">{lesson.programName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" />{lesson.time}
                              </p>
                              <Badge variant={lesson.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                {lesson.status === 'pending_payment' ? 'Unpaid' : lesson.status}
                              </Badge>
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
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No lessons scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real Students */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">{t.dashboard.admin.students}</CardTitle>
                <CardDescription>Recently registered students</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No students yet</p>
                ) : (
                  <div className="space-y-4">
                    {students.slice(0, 3).map((student) => (
                      <div key={student._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        {student.level && <Badge variant="outline">{student.level}</Badge>}
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/admin/students">
                    View All Students <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <Card>
            <CardHeader><CardTitle className="font-serif">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col py-4" asChild>
                  <Link href="/admin/calendar"><Calendar className="mb-2 h-6 w-6" />Manage Calendar</Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4" asChild>
                  <Link href="/admin/homework-submissions">
                    <svg className="mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Homework Submissions
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4" asChild>
                  <Link href="/admin/blog">
                    <svg className="mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Write Blog Post
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4" asChild>
                  <Link href="/admin/earnings"><DollarSign className="mb-2 h-6 w-6" />View Earnings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}