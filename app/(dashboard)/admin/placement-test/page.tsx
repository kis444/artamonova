'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, HelpCircle } from 'lucide-react'

type Q = {
  _id: string; question: string; options: string[]
  correctAnswer: number; level: string; order: number; active: boolean
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const levelColors: Record<string, string> = {
  A1: 'bg-green-100 text-green-800', A2: 'bg-emerald-100 text-emerald-800',
  B1: 'bg-blue-100 text-blue-800', B2: 'bg-indigo-100 text-indigo-800',
  C1: 'bg-purple-100 text-purple-800', C2: 'bg-red-100 text-red-800',
}

const emptyForm = { question: '', options: ['', '', '', ''], correctAnswer: 0, level: 'A1', order: 0, active: true }

export default function AdminPlacementTestPage() {
  const [questions, setQuestions] = useState<Q[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    fetch('/api/placement-test/questions')
      .then(r => r.json())
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  function openNew() {
    setEditingId(null)
    setForm({ ...emptyForm, order: questions.length })
    setDialogOpen(true)
  }

  function openEdit(q: Q) {
    setEditingId(q._id)
    setForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer, level: q.level, order: q.order, active: q.active })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.question || form.options.some(o => !o.trim())) return
    setSaving(true)
    const url = editingId ? `/api/placement-test/questions/${editingId}` : '/api/placement-test/questions'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      if (editingId) setQuestions(prev => prev.map(q => q._id === editingId ? data : q))
      else setQuestions(prev => [...prev, data])
      setDialogOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return
    await fetch(`/api/placement-test/questions/${id}`, { method: 'DELETE' })
    setQuestions(prev => prev.filter(q => q._id !== id))
  }

  const filtered = filterLevel === 'all' ? questions : questions.filter(q => q.level === filterLevel)
  const byLevel = LEVELS.reduce((acc, l) => ({ ...acc, [l]: questions.filter(q => q.level === l).length }), {} as Record<string, number>)

  return (
    <>
      <DashboardHeader title="Placement Test" />
      <main className="p-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {LEVELS.map(l => (
            <Card key={l} className="cursor-pointer" onClick={() => setFilterLevel(l === filterLevel ? 'all' : l)}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-primary">{byLevel[l] || 0}</p>
                <Badge className={`text-xs mt-1 ${levelColors[l]}`}>{l}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant={filterLevel === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterLevel('all')}>
              All ({questions.length})
            </Button>
            {LEVELS.map(l => (
              <Button key={l} variant={filterLevel === l ? 'default' : 'outline'} size="sm" onClick={() => setFilterLevel(l)}>
                {l}
              </Button>
            ))}
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Questions ({filtered.length})</CardTitle>
            <CardDescription>Students take this test to determine their level and get auto-enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-8"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading...</span></div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <HelpCircle className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No questions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((q, idx) => (
                  <div key={q._id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
                          <Badge className={`text-xs ${levelColors[q.level]}`}>{q.level}</Badge>
                          {!q.active && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <p className="font-medium mb-3">{q.question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${oi === q.correctAnswer ? 'bg-green-500/10 border border-green-500/30 font-medium text-green-700 dark:text-green-400' : 'bg-muted/30'}`}>
                              <span className="font-bold text-xs">{String.fromCharCode(65 + oi)}.</span>
                              {opt}
                              {oi === q.correctAnswer && <span className="ml-auto text-xs">✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q._id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{editingId ? 'Edit Question' : 'Add Question'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question *</Label>
                <Input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Enter question..." />
              </div>

              <div className="space-y-2">
                <Label>Options * (mark correct with ✓)</Label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button onClick={() => setForm(p => ({ ...p, correctAnswer: i }))}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold border transition-colors ${form.correctAnswer === i ? 'bg-green-500 text-white border-green-500' : 'border-border hover:border-primary'}`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                    <Input value={opt} onChange={e => {
                      const opts = [...form.options]; opts[i] = e.target.value
                      setForm(p => ({ ...p, options: opts }))
                    }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Click A/B/C/D to mark as correct answer</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                    className="w-full rounded-md border bg-background p-2">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} min={0} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.question || form.options.some(o => !o.trim()) || saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Add Question'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}