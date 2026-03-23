'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Edit, HelpCircle, PenTool, FileUp, X, Youtube, Music, FileText, Link } from 'lucide-react'

type MediaAttachment = {
  type: 'youtube' | 'audio' | 'pdf' | 'link'
  url: string
  label?: string
}

type Question = {
  question: string
  type: 'multiple_choice' | 'text'
  options: string[]
  correctAnswer: string | number
  points: number
  media?: MediaAttachment | null
}

type HomeworkTemplate = {
  _id?: string
  type: 'quiz' | 'writing' | 'file'
  title: string
  description: string
  instructions: string
  questions?: Question[]
  prompt?: string
  wordLimit?: number
  dueDaysAfterUnlock: number
  order: number
  active: boolean
}

const emptyQuestion = (): Question => ({
  question: '', type: 'multiple_choice',
  options: ['', ''], correctAnswer: 0, points: 1, media: null,
})

export default function LessonHomeworkPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<{ titleEn: string } | null>(null)
  const [homeworkList, setHomeworkList] = useState<HomeworkTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<HomeworkTemplate | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [type, setType] = useState<'quiz' | 'writing' | 'file'>('quiz')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dueDaysAfterUnlock, setDueDaysAfterUnlock] = useState(7)
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()])
  const [prompt, setPrompt] = useState('')
  const [wordLimit, setWordLimit] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/lessons/${lessonId}`).then(r => r.json()),
      fetch(`/api/admin/lessons/${lessonId}/homework`).then(r => r.json()),
    ]).then(([lessonData, homeworkData]) => {
      setLesson(lessonData)
      setHomeworkList(Array.isArray(homeworkData) ? homeworkData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [lessonId])

  const resetForm = () => {
    setType('quiz'); setTitle(''); setDescription(''); setInstructions('')
    setDueDaysAfterUnlock(7); setOrder(homeworkList.length); setActive(true)
    setQuestions([emptyQuestion()]); setPrompt(''); setWordLimit(0); setEditing(null)
  }

  const openNew = () => { resetForm(); setDialogOpen(true) }

  const openEdit = (hw: HomeworkTemplate) => {
    setEditing(hw); setType(hw.type); setTitle(hw.title)
    setDescription(hw.description || ''); setInstructions(hw.instructions || '')
    setDueDaysAfterUnlock(hw.dueDaysAfterUnlock); setOrder(hw.order); setActive(hw.active)
    if (hw.type === 'quiz' && hw.questions) setQuestions(hw.questions)
    else if (hw.type === 'writing') { setPrompt(hw.prompt || ''); setWordLimit(hw.wordLimit || 0) }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title) return
    setSaving(true)
    const body: any = { type, title, description, instructions, dueDaysAfterUnlock, order, active }
    if (type === 'quiz') body.questions = questions
    else if (type === 'writing') { body.prompt = prompt; body.wordLimit = wordLimit }

    const url = editing?._id
      ? `/api/admin/lessons/${lessonId}/homework/${editing._id}`
      : `/api/admin/lessons/${lessonId}/homework`
    const method = editing?._id ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      if (editing?._id) {
        setHomeworkList(prev => prev.map(h => h._id === editing._id ? (data.template || data) : h))
      } else {
        // data.template = HomeworkTemplate, data.generatedFor = count
        setHomeworkList(prev => [...prev, data.template || data])
        if (data.generatedFor !== undefined) {
          alert(`✅ Homework created and sent to ${data.generatedFor} enrolled student(s)!`)
        }
      }
      setDialogOpen(false); resetForm()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this homework?')) return
    await fetch(`/api/admin/lessons/${lessonId}/homework/${id}`, { method: 'DELETE' })
    setHomeworkList(prev => prev.filter(h => h._id !== id))
  }

  // Question helpers
  const updateQ = (i: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }
  const updateOption = (qi: number, oi: number, val: string) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q
      const opts = [...q.options]; opts[oi] = val; return { ...q, options: opts }
    }))
  }
  const addOption = (qi: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: [...q.options, ''] } : q))
  }
  const removeOption = (qi: number, oi: number) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q
      const opts = q.options.filter((_, i) => i !== oi)
      return { ...q, options: opts, correctAnswer: 0 }
    }))
  }
  const updateMedia = (qi: number, field: keyof MediaAttachment, value: string) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q
      const media = q.media ? { ...q.media, [field]: value } : { type: field === 'type' ? value as any : 'link', url: '', [field]: value }
      return { ...q, media }
    }))
  }
  const clearMedia = (qi: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, media: null } : q))
  }
  const setMediaType = (qi: number, mtype: MediaAttachment['type']) => {
    setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, media: { type: mtype, url: '', label: '' } } : q))
  }

  const mediaIcon = (t: string) => {
    if (t === 'youtube') return <Youtube className="h-4 w-4 text-red-500" />
    if (t === 'audio') return <Music className="h-4 w-4 text-blue-500" />
    if (t === 'pdf') return <FileText className="h-4 w-4 text-orange-500" />
    return <Link className="h-4 w-4 text-primary" />
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Homework" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title={`Homework: ${lesson?.titleEn || 'Lesson'}`} />
      <main className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push(`/admin/programs/${programId}/lessons`)}>
            ← Back to Lessons
          </Button>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Homework
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Homework Assignments</CardTitle>
            <CardDescription>
              When you add a new homework, it's automatically sent to all enrolled students.
              Quiz results are auto-graded; writing needs manual grading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {homeworkList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileUp className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No homework yet. Click "Add Homework" to create quizzes or writing tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {homeworkList.map((hw) => (
                  <div key={hw._id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {hw.type === 'quiz' ? <HelpCircle className="h-4 w-4 text-blue-500" /> :
                         hw.type === 'writing' ? <PenTool className="h-4 w-4 text-green-500" /> :
                         <FileUp className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{hw.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {hw.type === 'quiz' ? 'Quiz' : hw.type === 'writing' ? 'Writing' : 'File Upload'}
                          </Badge>
                          {!hw.active && <Badge variant="secondary">Draft</Badge>}
                          <Badge variant="secondary" className="text-xs">Due in {hw.dueDaysAfterUnlock}d</Badge>
                        </div>
                        {hw.type === 'quiz' && hw.questions && (
                          <p className="text-xs text-muted-foreground">
                            {hw.questions.length} questions
                            {hw.questions.some(q => q.media) && ' · has media'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(hw)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(hw._id!)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8">
            <div className="w-full max-w-3xl rounded-lg bg-background p-6 shadow-lg mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-semibold">
                  {editing ? 'Edit Homework' : 'Add Homework'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select value={type} onChange={e => setType(e.target.value as any)}
                    className="w-full rounded-md border bg-background p-2">
                    <option value="quiz">📝 Quiz (Auto-correct)</option>
                    <option value="writing">✍️ Writing (Manual grading)</option>
                    <option value="file">📎 File Upload</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Homework title" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2} placeholder="Detailed instructions..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due (days after unlock)</Label>
                    <Input type="number" value={dueDaysAfterUnlock} onChange={e => setDueDaysAfterUnlock(Number(e.target.value))} min={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} min={0} />
                  </div>
                </div>

                {/* QUIZ */}
                {type === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Questions</Label>
                      <Button size="sm" onClick={() => setQuestions(prev => [...prev, emptyQuestion()])}>
                        <Plus className="h-4 w-4 mr-1" /> Add Question
                      </Button>
                    </div>

                    {questions.map((q, qi) => (
                      <Card key={qi} className="border-2">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <Label className="font-semibold">Question {qi + 1}</Label>
                            {questions.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <Textarea
                            value={q.question}
                            onChange={e => updateQ(qi, 'question', e.target.value)}
                            placeholder="Enter question..."
                            rows={2}
                          />

                          {/* MEDIA SECTION */}
                          <div className="rounded-lg border border-dashed p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm text-muted-foreground">📎 Media (optional)</Label>
                              {q.media ? (
                                <Button variant="ghost" size="sm" onClick={() => clearMedia(qi)} className="h-6 text-xs text-destructive">
                                  Remove
                                </Button>
                              ) : null}
                            </div>

                            {!q.media ? (
                              <div className="flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline" onClick={() => setMediaType(qi, 'youtube')} className="h-7 text-xs">
                                  <Youtube className="h-3 w-3 mr-1 text-red-500" /> YouTube
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setMediaType(qi, 'audio')} className="h-7 text-xs">
                                  <Music className="h-3 w-3 mr-1 text-blue-500" /> Audio
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setMediaType(qi, 'pdf')} className="h-7 text-xs">
                                  <FileText className="h-3 w-3 mr-1 text-orange-500" /> PDF
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setMediaType(qi, 'link')} className="h-7 text-xs">
                                  <Link className="h-3 w-3 mr-1" /> Link
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {mediaIcon(q.media.type)}
                                  <span className="text-sm font-medium capitalize">{q.media.type}</span>
                                </div>
                                <Input
                                  value={q.media.url}
                                  onChange={e => updateMedia(qi, 'url', e.target.value)}
                                  placeholder={
                                    q.media.type === 'youtube' ? 'https://youtu.be/...' :
                                    q.media.type === 'audio' ? 'https://example.com/audio.mp3' :
                                    q.media.type === 'pdf' ? 'https://example.com/file.pdf' :
                                    'https://...'
                                  }
                                />
                                <Input
                                  value={q.media.label || ''}
                                  onChange={e => updateMedia(qi, 'label', e.target.value)}
                                  placeholder="Label (optional, e.g. 'Listen to the recording')"
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Answer Type</Label>
                            <select value={q.type} onChange={e => updateQ(qi, 'type', e.target.value as any)}
                              className="rounded-md border bg-background p-2 text-sm">
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="text">Written Answer</option>
                            </select>
                          </div>

                          {q.type === 'multiple_choice' && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex gap-2 items-center">
                                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${Number(q.correctAnswer) === oi ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                                    {String.fromCharCode(65 + oi)}
                                  </div>
                                  <Input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="flex-1" />
                                  {q.options.length > 2 && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(qi, oi)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button size="sm" variant="outline" onClick={() => addOption(qi)}>
                                <Plus className="h-3 w-3 mr-1" /> Add Option
                              </Button>
                              <div className="space-y-1 mt-2">
                                <Label className="text-sm">Correct Answer</Label>
                                <select value={String(q.correctAnswer)} onChange={e => updateQ(qi, 'correctAnswer', Number(e.target.value))}
                                  className="rounded-md border bg-background p-2 text-sm w-full">
                                  {q.options.map((opt, oi) => (
                                    <option key={oi} value={oi}>
                                      {String.fromCharCode(65 + oi)}. {opt || `Option ${oi + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          {q.type === 'text' && (
                            <div className="space-y-2">
                              <Label>Model Answer (optional)</Label>
                              <Input value={q.correctAnswer as string} onChange={e => updateQ(qi, 'correctAnswer', e.target.value)} placeholder="Expected answer..." />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Points:</Label>
                            <Input type="number" value={q.points} onChange={e => updateQ(qi, 'points', Number(e.target.value))}
                              min={1} max={10} className="w-20" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* WRITING */}
                {type === 'writing' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Writing Prompt</Label>
                      <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Describe the writing task..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Word Limit (0 = no limit)</Label>
                      <Input type="number" value={wordLimit} onChange={e => setWordLimit(Number(e.target.value))} min={0} />
                    </div>
                  </div>
                )}

                {/* FILE */}
                {type === 'file' && (
                  <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                    Students can upload files up to 10MB (PDF, Word, Images).
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label>Active (visible to students)</Label>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={!title || saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editing ? 'Save Changes' : 'Create & Send to Students'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}