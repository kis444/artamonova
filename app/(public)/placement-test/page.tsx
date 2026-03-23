'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, RotateCcw, Loader2, Lock, HelpCircle } from 'lucide-react'
import Link from 'next/link'

type Q = { _id: string; question: string; options: string[]; correctAnswer: number; level: string }
type Phase = 'intro' | 'test' | 'submitting' | 'result'

export default function PlacementTestPage() {
  const { t } = useLocale()
  const { data: session } = useSession()
  const [questions, setQuestions] = useState<Q[]>([])
  const [loadingQ, setLoadingQ] = useState(true)
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<{ level: string; percentage: number; enrolledIn?: string; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/placement-test/questions')
      .then(r => r.json())
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoadingQ(false) })
  }, [])

  const question = questions[currentQ]
  const progress = questions.length ? (currentQ / questions.length) * 100 : 0

  function handleNext() {
    if (selected === null || !question) return
    const newAnswers = { ...answers, [question._id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      handleSubmit(newAnswers)
    }
  }

  async function handleSubmit(finalAnswers: Record<string, number>) {
    setPhase('submitting')
    try {
      const res = await fetch('/api/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      })
      const data = await res.json()
      setResult(data)
    } catch { }
    setPhase('result')
  }

  function restart() {
    setPhase('intro'); setCurrentQ(0); setAnswers({})
    setSelected(null); setResult(null)
  }

  return (
    <div className="py-12">
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">

          {phase === 'intro' && (
            <div className="text-center">
              <h1 className="mb-4 font-serif text-4xl font-bold">{t.test.title}</h1>
              <p className="mb-8 text-lg text-muted-foreground">{t.test.subtitle}</p>
              <Card>
                <CardContent className="pt-6 pb-8 space-y-4">
                  {loadingQ ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { val: questions.length || '?', label: 'Questions' },
                        { val: '~10', label: 'Minutes' },
                        { val: 'A1–C1', label: 'Levels' },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg bg-muted/50 p-4">
                          <p className="font-serif text-2xl font-bold text-primary">{s.val}</p>
                          <p className="text-sm text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!session && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-700 dark:text-amber-400">
                      <Lock className="h-4 w-4 shrink-0" />
                      Log in to save your results and get auto-enrolled in the right program.
                    </div>
                  )}
                  {questions.length === 0 && !loadingQ ? (
                    <div className="text-center text-muted-foreground py-4">
                      <HelpCircle className="mx-auto mb-2 h-8 w-8 opacity-40" />
                      <p>No questions available yet.</p>
                    </div>
                  ) : (
                    <Button size="lg" className="w-full" onClick={() => setPhase('test')} disabled={loadingQ || questions.length === 0}>
                      {t.test.start} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {phase === 'test' && question && (
            <div>
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Question {currentQ + 1} of {questions.length}</span>
                  <Badge variant="outline">{question.level}</Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">{question.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {question.options.map((opt, idx) => (
                    <button key={idx} onClick={() => setSelected(idx)}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${selected === idx ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                      <span className="mr-3 font-medium text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  ))}
                  <Button className="mt-4 w-full" disabled={selected === null} onClick={handleNext}>
                    {currentQ < questions.length - 1 ? t.test.next : t.test.finish}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {phase === 'submitting' && (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Calculating your level...</p>
            </div>
          )}

          {phase === 'result' && (
            <Card>
              <CardContent className="pt-8 pb-8 space-y-6 text-center">
                <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">{t.test.result}</p>
                  <p className="font-serif text-6xl font-bold text-primary">{result?.level || '—'}</p>
                  {result && <p className="mt-2 text-muted-foreground">Score: {result.percentage}%</p>}
                </div>
                {result?.message && (
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">{result.message}</div>
                )}
                <div className="flex flex-col gap-3">
                  {session ? (
                    <Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
                  ) : (
                    <Button asChild><Link href="/register">Create Account to Start Learning</Link></Button>
                  )}
                  <Button variant="outline" onClick={restart}>
                    <RotateCcw className="mr-2 h-4 w-4" />{t.test.retake}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}