'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  FileText, Upload, Loader2, CheckCircle, MessageSquare, Paperclip,
  XCircle, CheckCircle2, Lock, PlayCircle, Headphones, BookOpen,
  ClipboardList, Youtube, Music, ExternalLink,
} from 'lucide-react'


type Media = { type: 'youtube' | 'audio' | 'pdf' | 'link'; url: string; label?: string }

type Question = {
  question: string; type: 'multiple_choice' | 'text'
  options?: string[]; correctAnswer?: number | string
  points: number; media?: Media | null
}

type Answer = { questionIndex: number; answer: any; isCorrect: boolean; pointsEarned: number }

type HW = {
  _id: string; title: string; description: string; dueDate: string
  type: 'quiz' | 'writing' | 'file'; questions?: Question[]; answers?: Answer[]
  lessonId?: string; lessonNumber?: number; lessonTitle?: string
  status: 'pending' | 'submitted' | 'auto_graded' | 'graded'
  submissionText?: string; submissionFileName?: string
  feedback?: string; score?: number; maxScore?: number; instructions?: string
}

type Lesson = { _id: string; order: number; titleEn: string; isUnlocked: boolean; materials: any[]; homework: HW[] }

// Renders media before question
function MediaDisplay({ media }: { media: Media }) {
  if (!media?.url) return null

  if (media.type === 'youtube') {
    const videoId = media.url.includes('youtu.be/')
      ? media.url.split('youtu.be/')[1]?.split('?')[0]
      : media.url.split('v=')[1]?.split('&')[0]
    if (!videoId) return (
      <a href={media.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-primary hover:underline">
        <Youtube className="h-4 w-4 text-red-500" />
        {media.label || 'Watch video'}
      </a>
    )
    return (
      <div className="space-y-1">
        {media.label && <p className="text-sm text-muted-foreground italic">{media.label}</p>}
        <div className="aspect-video w-full max-w-lg overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="h-full w-full"
            allowFullScreen
            title="Video"
          />
        </div>
      </div>
    )
  }

  if (media.type === 'audio') {
    return (
      <div className="space-y-1">
        {media.label && <p className="text-sm text-muted-foreground italic">{media.label}</p>}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <Headphones className="h-5 w-5 text-blue-500" />
          <audio controls className="flex-1 h-8">
            <source src={media.url} />
            <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary">
              Open audio
            </a>
          </audio>
        </div>
      </div>
    )
  }

  if (media.type === 'pdf') {
    return (
      <a href={media.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm hover:bg-muted/50 transition-colors">
        <FileText className="h-5 w-5 text-orange-500" />
        <span className="font-medium">{media.label || 'Open PDF'}</span>
        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
      </a>
    )
  }

  return (
    <a href={media.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm hover:bg-muted/50 transition-colors">
      <ExternalLink className="h-5 w-5 text-primary" />
      <span className="font-medium">{media.label || media.url}</span>
    </a>
  )
}

function HomeworkContent() {
  const { t } = useLocale()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<HW | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [quizResult, setQuizResult] = useState<{ score: number; maxScore: number; percentage: number; answers: Answer[] } | null>(null)
  const [activeLesson, setActiveLesson] = useState<string>(lessonParam || '')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    Promise.all([
      fetch('/api/student/lessons').then(r => r.json()),
      fetch('/api/student/homework').then(r => r.json()),
    ]).then(([lessonsData, homeworkData]) => {
      const allLessons = lessonsData.lessons || []
      const allHomework = Array.isArray(homeworkData) ? homeworkData : []

      const lessonsList: Lesson[] = allLessons.map((lesson: any) => ({
        _id: lesson._id,
        order: lesson.order,
        titleEn: lesson.titleEn,
        isUnlocked: lesson.isUnlocked,
        materials: lesson.materials || [],
        homework: allHomework.filter((h: any) => String(h.lessonId) === String(lesson._id)),
      }))

      setLessons(lessonsList.sort((a, b) => a.order - b.order))
      if (lessonParam) setActiveLesson(lessonParam)
      else if (lessonsList.length > 0) setActiveLesson(lessonsList[0]._id)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session, lessonParam])

  const currentLesson = lessons.find(l => l._id === activeLesson)
  const currentHomework = currentLesson?.homework || []
  const currentMaterials = currentLesson?.materials || []

  function openSubmit(hw: HW) {
    if (hw.status !== 'pending') {
      setSelected(hw)
      setQuizResult({
        score: hw.score || 0,
        maxScore: hw.maxScore || hw.questions?.length || 0,
        percentage: hw.maxScore ? Math.round(((hw.score || 0) / hw.maxScore) * 100) : 0,
        answers: hw.answers || [],
      })
      setSubmitted(true)
      setDialogOpen(true)
      return
    }
    setSelected(hw)
    if (hw.type === 'quiz' && hw.questions) {
      setQuizAnswers(new Array(hw.questions.length).fill(''))
    } else if (hw.type === 'writing') {
      setText(hw.submissionText || '')
    }
    setFile(null); setSubmitted(false); setQuizResult(null); setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!selected) return
    setSubmitting(true)
    let submissionData: any = {}

    if (selected.type === 'quiz') {
      submissionData = { answers: quizAnswers.map(a => { const n = parseInt(a, 10); return isNaN(n) ? -1 : n }) }
    } else {
      let fileUrl = ''; let fileName = ''
      if (file) {
        fileName = file.name
        fileUrl = await new Promise(resolve => {
          const r = new FileReader(); r.onload = () => resolve(r.result as string); r.readAsDataURL(file)
        })
      }
      submissionData = { submissionText: text, submissionFileUrl: fileUrl, submissionFileName: fileName }
    }

    const res = await fetch(`/api/homework/${selected._id}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    })
    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setSubmitted(true)
      if (selected.type === 'quiz') {
        const score = data.score || 0
        const maxScore = data.maxScore || selected.questions?.length || 0
        setQuizResult({ score, maxScore, percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0, answers: data.answers || [] })
      }
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        homework: lesson.homework.map(h =>
          h._id === selected._id
            ? { ...h, status: selected.type === 'quiz' ? 'auto_graded' : 'submitted', score: data.score, maxScore: data.maxScore, answers: data.answers }
            : h
        ),
      })))
    }
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Homework and Materials" />
        <main className="p-6 flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Homework and Materials" />
      <main className="p-6">
        {lessons.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No lessons available yet. Ask your teacher to enroll you in a program!</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-48 shrink-0">
              <Card>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {lessons.map(lesson => (
                      <button key={lesson._id} onClick={() => lesson.isUnlocked && setActiveLesson(lesson._id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          activeLesson === lesson._id ? 'bg-primary text-primary-foreground' :
                          lesson.isUnlocked ? 'hover:bg-muted' : 'opacity-40 cursor-not-allowed'
                        }`}
                        disabled={!lesson.isUnlocked}
                      >
                        <div className="flex items-center gap-2">
                          {!lesson.isUnlocked && <Lock className="h-3 w-3" />}
                          <span className="text-sm font-medium">Lesson {lesson.order}</span>
                        </div>
                        {lesson.homework.filter(h => h.status === 'pending').length > 0 && (
                          <span className="ml-5 text-xs text-destructive font-medium">
                            {lesson.homework.filter(h => h.status === 'pending').length} pending
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="flex-1">
              {currentLesson ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Materials */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Materials — Lesson {currentLesson.order}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentMaterials.length > 0 ? (
                        <div className="space-y-2">
                          {currentMaterials.map((m, i) => (
                            <a key={i} href={m.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                              {m.type === 'video' && <PlayCircle className="h-5 w-5 text-primary" />}
                              {m.type === 'audio' && <Headphones className="h-5 w-5 text-primary" />}
                              {m.type === 'pdf' && <FileText className="h-5 w-5 text-primary" />}
                              {(m.type === 'link' || m.type === 'drive') && <ExternalLink className="h-5 w-5 text-primary" />}
                              <span className="font-medium">{m.title}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8 text-sm">No materials yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Homework */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif text-lg flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Homework — Lesson {currentLesson.order}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentHomework.length > 0 ? (
                        <div className="space-y-4">
                          {currentHomework.map((hw) => {
                            const isCompleted = hw.status !== 'pending'
                            const scoreDisplay = hw.score !== undefined && hw.maxScore
                              ? `${hw.score}/${hw.maxScore} (${Math.round((hw.score / hw.maxScore) * 100)}%)`
                              : null

                            return (
                              <div key={hw._id} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium">{hw.title}</p>
                                    <p className="text-sm text-muted-foreground">{hw.description}</p>
                                  </div>
                                  <Badge variant={isCompleted ? 'default' : 'destructive'}>
                                    {isCompleted ? (scoreDisplay || 'Completed') : 'Pending'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Due: {new Date(hw.dueDate).toLocaleDateString()}
                                </p>
                                {hw.status === 'graded' && hw.feedback && (
                                  <div className="mb-3 rounded-lg bg-green-500/10 p-2 flex gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700 dark:text-green-400">{hw.feedback}</p>
                                  </div>
                                )}
                                {hw.status === 'pending' ? (
                                  <Button size="sm" onClick={() => openSubmit(hw)}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {hw.type === 'quiz' ? 'Take Quiz' : 'Submit'}
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => openSubmit(hw)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Review Answers
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8 text-sm">No homework for this lesson</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground">Select a lesson from the left</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Quiz / Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.description}</DialogDescription>
          </DialogHeader>

          {submitted && quizResult ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-xl font-bold text-green-600">
                  {quizResult.score}/{quizResult.maxScore} ({quizResult.percentage}%)
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-semibold">Answer Review:</p>
                {selected?.questions?.map((q, idx) => {
                  const ua = quizResult.answers?.[idx]
                  const isCorrect = ua?.isCorrect
                  const userAns = ua?.answer
                  const correctAns = q.type === 'multiple_choice'
                    ? q.options?.[q.correctAnswer as number]
                    : q.correctAnswer

                  return (
                    <div key={idx} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                      {q.media && <div className="mb-2"><MediaDisplay media={q.media} /></div>}
                      <p className="font-medium mb-2 text-sm">{idx + 1}. {q.question}</p>
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm">Your answer: <strong>
                          {userAns !== undefined && userAns !== -1
                            ? (q.type === 'multiple_choice' ? q.options?.[userAns] : userAns)
                            : 'Not answered'}
                        </strong></span>
                      </div>
                      {!isCorrect && correctAns && (
                        <p className="text-sm text-muted-foreground ml-6">Correct: <strong className="text-green-600">{correctAns}</strong></p>
                      )}
                    </div>
                  )
                })}
              </div>
              <Button className="w-full" onClick={() => setDialogOpen(false)}>Close</Button>
            </div>
          ) : selected?.status === 'pending' ? (
            <div className="space-y-4">
              {selected.instructions && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">{selected.instructions}</div>
              )}

              {selected.type === 'quiz' && selected.questions && (
                <div className="space-y-6">
                  {selected.questions.map((q, idx) => (
                    <div key={idx} className="space-y-3">
                      {/* Media BEFORE question */}
                      {q.media && q.media.url && (
                        <MediaDisplay media={q.media} />
                      )}
                      <Label className="font-medium">{idx + 1}. {q.question}</Label>
                      {q.type === 'multiple_choice' && q.options && (
                        <RadioGroup value={quizAnswers[idx] || ''} onValueChange={val => {
                          const a = [...quizAnswers]; a[idx] = val; setQuizAnswers(a)
                        }}>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center space-x-2">
                              <RadioGroupItem value={String(oi)} id={`q${idx}_${oi}`} />
                              <Label htmlFor={`q${idx}_${oi}`} className="font-normal cursor-pointer">
                                {String.fromCharCode(65 + oi)}. {opt}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                      {q.type === 'text' && (
                        <Textarea value={quizAnswers[idx] || ''} onChange={e => {
                          const a = [...quizAnswers]; a[idx] = e.target.value; setQuizAnswers(a)
                        }} placeholder="Type your answer..." rows={2} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selected.type === 'writing' && (
                <div className="space-y-3">
                  <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer..." rows={6} />
                  <div className="border-dashed border-2 p-4 text-center cursor-pointer rounded-lg" onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    {file ? (
                      <div className="flex items-center gap-2 justify-center text-sm">
                        <Paperclip className="h-4 w-4 text-primary" />
                        <span>{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">Click to upload file (optional)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          ) : (
            <div className="space-y-3 text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="font-medium">Assignment completed</p>
              {selected?.score !== undefined && selected?.maxScore && (
                <p className="text-lg font-bold">
                  {selected.score}/{selected.maxScore} ({Math.round((selected.score / selected.maxScore) * 100)}%)
                </p>
              )}
              <Button className="w-full" onClick={() => setDialogOpen(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
export default function StudentHomeworkPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <HomeworkContent />
    </Suspense>
  )
}