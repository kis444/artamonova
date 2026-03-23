'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, Lock, FileText, CheckCircle, Calendar, Clock, Video, CreditCard, PlusCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

type Lesson = {
  _id: string
  order: number
  titleEn: string
  titleRo: string
  titleRu: string
  descriptionEn: string
  descriptionRo: string
  descriptionRu: string
  skills: string[]
  materials?: { type: string; title: string; url: string }[]
  isUnlocked: boolean
  status: string
}

type Booking = {
  _id: string
  programName: string
  date: string
  time: string
  status: string
  meetLink: string
  price?: number
}

type Course = {
  _id: string
  nameEn: string
  level: string
}

type Student = {
  _id: string
  name: string
  email: string
  permanentMeetLink: string
}

export default function LessonsPage() {
  const { t, locale } = useLocale()
  const { data: session } = useSession()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [materialsDialogOpen, setMaterialsDialogOpen] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    Promise.all([
      fetch('/api/student/profile').then(r => r.json()),
      fetch('/api/student/courses').then(r => r.json()),
      fetch('/api/student/lessons').then(r => r.json()),
      fetch('/api/student/bookings').then(r => r.json()),
    ]).then(([profileData, courseData, lessonsData, bookingsData]) => {
      setStudent(profileData)
      setCourse(courseData.course || null)
      setLessons(lessonsData.lessons || [])
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [session])

  const getLessonTitle = (lesson: Lesson) => {
    if (locale === 'ro' && lesson.titleRo) return lesson.titleRo
    if (locale === 'ru' && lesson.titleRu) return lesson.titleRu
    return lesson.titleEn
  }

  const getLessonDescription = (lesson: Lesson) => {
    if (locale === 'ro' && lesson.descriptionRo) return lesson.descriptionRo
    if (locale === 'ru' && lesson.descriptionRu) return lesson.descriptionRu
    return lesson.descriptionEn
  }

  const upcomingBookings = bookings
    .filter(l => {
      const lessonDate = new Date(`${l.date}T${l.time}`)
      return lessonDate > new Date()
    })
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())

  const pendingPaymentLessons = upcomingBookings.filter(l => l.status === 'pending_payment')
  const confirmedBookings = upcomingBookings.filter(l => l.status === 'confirmed')

  async function confirmPayment(bookingId: string) {
    setProcessing(true)
    const res = await fetch('/api/booking/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    })
    setProcessing(false)
    if (res.ok) {
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'confirmed' } : b
      ))
      setPayDialogOpen(false)
    }
  }

  const getMeetLinkForLesson = (booking: Booking) => {
    // Prioritize: student's permanent link > booking specific link > default
    if (student?.permanentMeetLink) return student.permanentMeetLink
    if (booking.meetLink) return booking.meetLink
    return 'https://meet.google.com'
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="My Lessons" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="My Lessons" />
      <main className="p-6">
        {/* Book a Lesson button */}
        <div className="mb-6 flex justify-end">
          <Button asChild size="lg" className="gap-2">
            <Link href="/booking">
              <PlusCircle className="h-5 w-5" />
              Book a Lesson
            </Link>
          </Button>
        </div>

        {/* Course Header */}
        {course && (
          <Card className="mb-6 bg-linear-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Course</p>
                  <h2 className="font-serif text-2xl font-bold">{course.nameEn}</h2>
                  <Badge className="mt-1" variant="outline">Level {course.level}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{confirmedBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                  <CreditCard className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingPaymentLessons.length}</p>
                  <p className="text-sm text-muted-foreground">Awaiting Payment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lessons.filter(l => l.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Lessons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-serif">Course Lessons</CardTitle>
            <CardDescription>Your learning path - lessons unlock as you book them</CardDescription>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No lessons available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const isLocked = !lesson.isUnlocked
                  const isCompleted = lesson.status === 'completed'
                  const isEvaluated = lesson.status === 'evaluated'
                  
                  return (
                    <div
                      key={lesson._id}
                      className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                        isLocked ? 'bg-muted/30 opacity-70' : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          isCompleted ? 'bg-green-500/20 text-green-600' :
                          isLocked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : isLocked ? (
                            <Lock className="h-6 w-6" />
                          ) : (
                            <span className="font-serif text-xl font-bold">{lesson.order}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{getLessonTitle(lesson)}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {getLessonDescription(lesson)}
                          </p>
                          {lesson.skills && lesson.skills.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {lesson.skills.slice(0, 3).map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                        {isEvaluated && (
                          <Badge variant="default">Evaluated</Badge>
                        )}
                        {!isLocked && !isCompleted && (
                          <>
                            {lesson.materials && lesson.materials.length > 0 && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedLesson(lesson)
                                  setMaterialsDialogOpen(true)
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Materials
                              </Button>
                            )}
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/homework?lesson=${lesson._id}`}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Homework
                              </Link>
                            </Button>
                          </>
                        )}
                        {isLocked && (
                          <p className="text-xs text-muted-foreground">
                            Book this lesson to unlock
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Upcoming Scheduled Lessons</CardTitle>
              <CardDescription>Your booked lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-xs font-medium">
                          {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold">
                          {new Date(booking.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{booking.programName}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(booking.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })} at {booking.time}
                        </p>
                        <Badge 
                          className="mt-1"
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        >
                          {booking.status === 'pending_payment' ? 'Pending Payment' : booking.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' && (
                        <Button asChild>
                          <a href={getMeetLinkForLesson(booking)} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 h-4 w-4" />
                            Join Lesson
                          </a>
                        </Button>
                      )}
                      {booking.status === 'pending_payment' && (
                        <Button 
                          variant="default"
                          onClick={() => {
                            setSelectedLesson(booking as any)
                            setPayDialogOpen(true)
                          }}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Materials Dialog */}
      <Dialog open={materialsDialogOpen} onOpenChange={setMaterialsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">
              {selectedLesson && getLessonTitle(selectedLesson)} - Materials
            </DialogTitle>
            <DialogDescription>
              Lesson materials and resources
            </DialogDescription>
          </DialogHeader>
          {selectedLesson?.materials && selectedLesson.materials.length > 0 ? (
            <div className="space-y-3 py-2">
              {selectedLesson.materials.map((material, idx) => (
                <a
                  key={idx}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {material.type === 'video' && <Video className="h-5 w-5 text-primary" />}
                    {material.type === 'pdf' && <FileText className="h-5 w-5 text-primary" />}
                    {material.type === 'link' && <ExternalLink className="h-5 w-5 text-primary" />}
                    <span className="font-medium">{material.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">
              No materials available for this lesson yet.
            </p>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setMaterialsDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirm Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for this lesson
            </DialogDescription>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium">{(selectedLesson as any).programName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date((selectedLesson as any).date).toLocaleDateString()} at {(selectedLesson as any).time}
                </p>
                <p className="mt-2 font-serif text-xl font-bold text-primary">
                  €{(selectedLesson as any).price || 45}
                </p>
              </div>
              <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This is a simulated payment. In production, you would be redirected to Stripe.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => confirmPayment((selectedLesson as any)._id)} disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Pay Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}