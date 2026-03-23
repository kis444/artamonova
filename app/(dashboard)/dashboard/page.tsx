'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Video, FileText, TrendingUp, Clock, ArrowRight, ExternalLink, BookOpen, Loader2 } from 'lucide-react'

type Booking = {
  _id: string
  programName: string
  date: string
  time: string
  status: string
  meetLink: string
}

type Homework = {
  _id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
}

type ProgressData = {
  currentLevel: string
  average: number
}

export default function StudentDashboard() {
  const { t } = useLocale()
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    Promise.all([
      fetch('/api/student/bookings').then(res => res.json()),
      fetch('/api/student/homework').then(res => res.json()),
      fetch('/api/student/progress').then(res => res.json())
    ]).then(([bookingsData, homeworkData, progressData]) => {
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setHomework(Array.isArray(homeworkData) ? homeworkData : [])
      setProgress(progressData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session])

  const upcomingLessons = bookings.filter(b => {
    const lessonDate = new Date(`${b.date}T${b.time}`)
    return lessonDate > new Date() && b.status === 'confirmed'
  })

  const pendingHomework = homework.filter(h => h.status === 'pending')
  const recentHomework = pendingHomework.slice(0, 3)

  if (loading) {
    return (
      <>
        <DashboardHeader title={`Welcome back, ${session?.user?.name || 'Student'}!`} />
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
      <DashboardHeader title={`Welcome back, ${session?.user?.name || 'Student'}!`} />
      
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
                  <p className="text-2xl font-bold">{upcomingLessons.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingHomework.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Homework</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/20">
                  <TrendingUp className="h-6 w-6 text-muted" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress?.currentLevel || '-'}</p>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Lessons */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif">{t.dashboard.student.upcomingLessons}</CardTitle>
                  <CardDescription>Your scheduled lessons</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/lessons">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingLessons.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingLessons.slice(0, 3).map((lesson) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <span className="text-xs font-medium">
                              {new Date(lesson.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold">
                              {new Date(lesson.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{lesson.programName}</p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(lesson.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })} at {lesson.time}
                            </p>
                            <Badge className="mt-1" variant="default">
                              {lesson.status}
                            </Badge>
                          </div>
                        </div>
                        {lesson.meetLink && (
                          <Button size="sm" asChild>
                            <a href={lesson.meetLink} target="_blank" rel="noopener noreferrer">
                              <Video className="mr-2 h-4 w-4" />
                              Join
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No upcoming lessons</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/booking">Book a Lesson</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Homework */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">{t.dashboard.student.homework}</CardTitle>
                <CardDescription>Assignments due soon</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingHomework.length > 0 ? (
                  <div className="space-y-4">
                    {recentHomework.map((hw) => (
                      <div key={hw._id} className="rounded-lg border border-border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <p className="font-medium">{hw.title}</p>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                          {hw.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(hw.dueDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                    {pendingHomework.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href="/dashboard/homework">
                          View All ({pendingHomework.length})
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No homework assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress & Materials */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">{t.dashboard.student.progress}</CardTitle>
              <CardDescription>Your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="text-muted-foreground">{progress?.average || 0}%</span>
                </div>
                <Progress value={progress?.average || 0} className="h-2" />
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/progress">
                  View Detailed Progress
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Course Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">{t.dashboard.student.materials}</CardTitle>
              <CardDescription>Access your learning resources</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">
                  Open Google Drive
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}