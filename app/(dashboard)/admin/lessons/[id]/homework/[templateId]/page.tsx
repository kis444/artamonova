'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2 } from 'lucide-react'

type Question = {
  question: string
  type: 'multiple_choice' | 'text'
  options: string[]
  correctAnswer: string | number
  points: number
}

export default function EditHomeworkPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  const templateId = params.templateId as string

  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'quiz' | 'writing' | 'audio' | 'file'>('quiz')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDays, setDueDays] = useState(7)
  const [order, setOrder] = useState(0)

  // Quiz specific
  const [questions, setQuestions] = useState<Question[]>([])

  // Writing specific
  const [prompt, setPrompt] = useState('')
  const [wordLimit, setWordLimit] = useState(0)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/lessons/${lessonId}/homework/${templateId}`)
      .then(res => res.json())
      .then(data => {
        setType(data.type)
        setTitle(data.title)
        setDescription(data.description || '')
        setDueDays(data.dueDays)
        setOrder(data.order)
        if (data.type === 'quiz') {
          setQuestions(data.questions || [])
        } else if (data.type === 'writing') {
          setPrompt(data.prompt || '')
          setWordLimit(data.wordLimit || 0)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lessonId, templateId])

  const addQuestion = () => {
    setQuestions([...questions, { question: '', type: 'multiple_choice', options: ['', ''], correctAnswer: 0, points: 1 }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options[optIndex] = value
    setQuestions(newQuestions)
  }

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options.push('')
    setQuestions(newQuestions)
  }

  const handleSave = async () => {
    setSaving(true)

    const body: any = {
      type,
      title,
      description,
      dueDays,
      order,
    }

    if (type === 'quiz') {
      body.questions = questions
    } else if (type === 'writing') {
      body.prompt = prompt
      body.wordLimit = wordLimit
    }

    const res = await fetch(`/api/admin/lessons/${lessonId}/homework/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push(`/admin/lessons/${lessonId}/homework`)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Edit Homework" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Edit Homework" />
      <main className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>← Back</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Edit Homework Assignment</CardTitle>
            <CardDescription>Update the assignment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Assignment Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">📝 Quiz (Auto-correct)</SelectItem>
                  <SelectItem value="writing">✍️ Writing (Manual grading)</SelectItem>
                  <SelectItem value="audio">🎤 Audio Recording</SelectItem>
                  <SelectItem value="file">📎 File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Grammar Quiz - Lesson 1" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Instructions for students..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due (days after lesson unlock)</Label>
                <Input type="number" value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} min={1} max={30} />
              </div>
              <div className="space-y-2">
                <Label>Order (display order)</Label>
                <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={0} />
              </div>
            </div>

            {/* Quiz Specific */}
            {type === 'quiz' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Questions</Label>
                  <Button size="sm" onClick={addQuestion}><Plus className="h-4 w-4 mr-1" /> Add Question</Button>
                </div>

                {questions.map((q, qIdx) => (
                  <Card key={qIdx} className="relative">
                    <CardContent className="pt-6 space-y-3">
                      <div className="absolute right-2 top-2">
                        {questions.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIdx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Question {qIdx + 1}</Label>
                        <Input value={q.question} onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)} placeholder="Enter your question..." />
                      </div>

                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select value={q.type} onValueChange={(v: any) => updateQuestion(qIdx, 'type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="text">Text Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex gap-2 items-center">
                              <Input value={opt} onChange={(e) => updateOption(qIdx, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`} />
                              <Button variant="ghost" size="sm" onClick={() => addOption(qIdx)}><Plus className="h-4 w-4" /></Button>
                            </div>
                          ))}
                          <div className="space-y-2 mt-2">
                            <Label>Correct Answer</Label>
                            <Select value={String(q.correctAnswer)} onValueChange={(v) => updateQuestion(qIdx, 'correctAnswer', Number(v))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {q.options.map((_, optIdx) => (
                                  <SelectItem key={optIdx} value={String(optIdx)}>Option {optIdx + 1}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <div className="space-y-2">
                          <Label>Correct Answer (optional)</Label>
                          <Input value={q.correctAnswer as string} onChange={(e) => updateQuestion(qIdx, 'correctAnswer', e.target.value)} placeholder="Expected answer..." />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input type="number" value={q.points} onChange={(e) => updateQuestion(qIdx, 'points', Number(e.target.value))} min={1} max={10} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Writing Specific */}
            {type === 'writing' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Writing Prompt</Label>
                  <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="Describe what students should write about..." />
                </div>
                <div className="space-y-2">
                  <Label>Word Limit (optional, 0 = no limit)</Label>
                  <Input type="number" value={wordLimit} onChange={(e) => setWordLimit(Number(e.target.value))} min={0} />
                </div>
              </div>
            )}

            {/* Audio/File specific */}
            {(type === 'audio' || type === 'file') && (
              <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                Students will be able to upload files up to 10MB.
                {type === 'audio' && ' Audio files (MP3, WAV) are recommended.'}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleSave} disabled={!title || saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}