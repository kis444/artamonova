'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Star, Loader2, CheckCircle, Clock, Video } from 'lucide-react'

type Booking = {
  _id: string; studentName: string; studentId: string
  programName: string; date: string; time: string
  status: string; meetLink: string
}

const SKILLS = ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading'] as const

export default function AdminEvaluatePage() {
  const [lessons, setLessons] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [skillScores, setSkillScores] = useState<Record<string, number>>({
    grammar: 7, vocabulary: 7, speaking: 7,
    writing: 7, listening: 7, reading: 7,
  })
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/booking/admin')
      .then((r) => r.json())
      .then((data) => {
        // Show confirmed lessons that are in the past (need evaluation)
        const now = new Date()
        const past = Array.isArray(data) ? data.filter((b: Booking) => {
          const lessonTime = new Date(`${b.date}T${b.time}`)
          return b.status === 'confirmed' && lessonTime < now
        }) : []
        setLessons(past)
        setLoading(false)
      })
  }, [])

  function openEvaluate(lesson: Booking) {
    setSelected(lesson)
    setSkillScores({ grammar: 7, vocabulary: 7, speaking: 7, writing: 7, listening: 7, reading: 7 })
    setFeedback('')
    setSaved(false)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)

    const res = await fetch(`/api/student/lesson/${selected._id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: selected.studentId,
        skillScores,
        feedback,
      }),
    })

    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setLessons((prev) => prev.filter((l) => l._id !== selected._id))
      setTimeout(() => setDialogOpen(false), 1500)
    }
  }

  const avgScore = Math.round(
    Object.values(skillScores).reduce((s, v) => s + v, 0) / SKILLS.length
  )

  return (
    <>
      <DashboardHeader title="Evaluate Lessons" />
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Lessons Awaiting Evaluation</CardTitle>
            <CardDescription>
              Past confirmed lessons — evaluate each student after the lesson
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /><span>Loading...</span>
              </div>
            ) : lessons.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500 opacity-60" />
                <p>All lessons have been evaluated!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                        {lesson.studentName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{lesson.studentName}</p>
                        <p className="text-sm text-muted-foreground">{lesson.programName}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.date} at {lesson.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Needs evaluation</Badge>
                      <Button size="sm" onClick={() => openEvaluate(lesson)}>
                        <Star className="mr-2 h-4 w-4" />
                        Evaluate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluate Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">Evaluate Lesson</DialogTitle>
              <DialogDescription>
                {selected?.studentName} — {selected?.programName} — {selected?.date} at {selected?.time}
              </DialogDescription>
            </DialogHeader>

            {saved ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="font-medium text-green-600">Evaluation saved! Student progress updated.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall score preview */}
                <div className="flex items-center justify-center rounded-lg bg-primary/5 py-4">
                  <div className="text-center">
                    <p className="font-serif text-4xl font-bold text-primary">{avgScore}</p>
                    <p className="text-sm text-muted-foreground">Average Score (1-10)</p>
                  </div>
                </div>

                {/* Skill sliders */}
                <div className="space-y-5">
                  {SKILLS.map((skill) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="capitalize">{skill}</Label>
                        <span className="font-bold text-primary">{skillScores[skill]}/10</span>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[skillScores[skill]]}
                        onValueChange={([v]) => setSkillScores((prev) => ({ ...prev, [skill]: v }))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Feedback for Student</Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write detailed feedback about the lesson..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Evaluation
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}