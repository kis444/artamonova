// app/(dashboard)/admin/homework-submissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  FileText, MessageSquare, CheckCircle, Loader2, Eye, Paperclip, Trash2,
} from 'lucide-react'

type Submission = {
  _id: string
  studentId: { _id: string; name: string; email: string }
  programId?: { _id: string; nameEn: string }
  lessonId?: { _id: string; titleEn: string; order: number }
  title: string
  type: string
  submissionText?: string
  submissionFileUrl?: string
  submissionFileName?: string
  answers?: any[]
  score?: number
  maxScore?: number
  feedback?: string
  status: string
  createdAt: string
  dueDate?: string
}

const statusVariant = (status: string) => {
  if (status === 'pending') return 'destructive'
  if (status === 'submitted') return 'secondary'
  if (status === 'auto_graded') return 'default'
  if (status === 'graded') return 'default'
  return 'outline'
}

const statusLabel = (status: string) => {
  if (status === 'pending') return 'Not Started'
  if (status === 'submitted') return 'Submitted'
  if (status === 'auto_graded') return 'Auto-graded'
  if (status === 'graded') return 'Graded'
  return status
}

export default function HomeworkSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded' | 'auto_graded'>('all')
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState('')
  const [grading, setGrading] = useState(false)
  const [graded, setGraded] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/homework-submissions')
      const data = await res.json()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async () => {
    if (!selected || !feedback) return
    setGrading(true)
    const res = await fetch(`/api/homework/${selected._id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    })
    setGrading(false)
    if (res.ok) {
      setGraded(true)
      setSubmissions((prev) =>
        prev.map((s) => s._id === selected._id ? { ...s, status: 'graded', feedback } : s)
      )
      setTimeout(() => { setViewOpen(false); setGraded(false) }, 1500)
    }
  }

  const filtered = filter === 'all' 
    ? submissions 
    : submissions.filter((s) => s.status === filter)

  if (loading) {
    return (
      <>
        <DashboardHeader title="Homework Submissions" />
        <main className="p-6 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Homework Submissions" />
      <main className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'submitted', 'auto_graded', 'graded'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'auto_graded' ? 'Auto-graded' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1 rounded-full bg-background/20 px-1.5 text-xs">
                  {submissions.filter((s) => f === 'all' || s.status === f).length}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Student Submissions</CardTitle>
            <CardDescription>
              Review and grade homework submitted by students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No submissions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-medium">{sub.studentId?.name || 'Unknown'}</p>
                        <Badge variant={statusVariant(sub.status)}>
                          {statusLabel(sub.status)}
                        </Badge>
                        {sub.programId && (
                          <Badge variant="outline" className="text-xs">
                            {sub.programId.nameEn}
                          </Badge>
                        )}
                        {sub.lessonId && (
                          <span className="text-xs text-muted-foreground">
                            Lesson {sub.lessonId.order}: {sub.lessonId.titleEn}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary">{sub.title}</p>
                      {sub.score !== undefined && sub.maxScore && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Score: {sub.score}/{sub.maxScore} ({Math.round((sub.score / sub.maxScore) * 100)}%)
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(sub.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelected(sub)
                        setFeedback(sub.feedback || '')
                        setGraded(false)
                        setViewOpen(true)
                      }}>
                        <Eye className="mr-1 h-3 w-3" />
                        {sub.status === 'graded' ? 'View' : 'Review'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{selected?.title}</DialogTitle>
              <DialogDescription>
                Student: {selected?.studentId?.name} ({selected?.studentId?.email})
              </DialogDescription>
            </DialogHeader>

            {graded ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="font-medium text-green-600">Feedback saved!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Program & Lesson info */}
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Program / Lesson</p>
                  <p className="text-sm font-medium">{selected?.programId?.nameEn}</p>
                  {selected?.lessonId && (
                    <p className="text-xs text-muted-foreground">
                      Lesson {selected.lessonId.order}: {selected.lessonId.titleEn}
                    </p>
                  )}
                </div>

                {/* Student submission */}
                {selected?.submissionText && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Student Answer</p>
                    <p className="text-sm whitespace-pre-wrap">{selected.submissionText}</p>
                  </div>
                )}

                {selected?.submissionFileName && (
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{selected.submissionFileName}</span>
                    {selected.submissionFileUrl && (
                      <a
                        href={selected.submissionFileUrl}
                        download={selected.submissionFileName}
                        className="ml-auto text-xs text-primary hover:underline"
                      >
                        Download
                      </a>
                    )}
                  </div>
                )}

                {/* Quiz answers if auto_graded */}
                {selected?.status === 'auto_graded' && selected.answers && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Quiz Answers</p>
                    {selected.answers.map((ans, idx) => (
                      <div key={idx} className="text-sm py-1">
                        <span className="font-medium">Q{idx + 1}:</span>{' '}
                        {ans.isCorrect ? '✓' : '✗'} {ans.answer}
                      </div>
                    ))}
                    <p className="mt-2 text-sm font-medium">
                      Score: {selected.score}/{selected.maxScore}
                    </p>
                  </div>
                )}

                {/* Feedback input */}
                <div className="space-y-2">
                  <Label>Your Feedback</Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write feedback for the student..."
                    rows={4}
                    disabled={selected?.status === 'graded'}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                  {selected?.status !== 'graded' && (
                    <Button onClick={handleGrade} disabled={!feedback || grading}>
                      {grading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Feedback & Grade
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}