'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Star, FileText } from 'lucide-react'

type Skill = { name: string; value: number }
type ProgressData = {
  skills: Skill[]
  currentLevel: string
  average: number
  recentHomework: { _id: string; title: string; score?: number; feedback?: string; gradedAt: string }[]
  recentEvaluations: { _id: string; lessonId: { title: string }; teacherScore: number; teacherFeedback: string; teacherEvaluatedAt: string }[]
}

const skillColors: Record<string, string> = {
  Grammar: 'bg-blue-500',
  Vocabulary: 'bg-purple-500',
  Speaking: 'bg-green-500',
  Writing: 'bg-orange-500',
  Listening: 'bg-pink-500',
  Reading: 'bg-cyan-500',
}

export default function ProgressPage() {
  const { t } = useLocale()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/progress')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <DashboardHeader title="My Progress" />
        <main className="p-6 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <DashboardHeader title="My Progress" />
        <main className="p-6">
          <div className="py-20 text-center text-muted-foreground">
            <TrendingUp className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No progress data yet. Complete some lessons!</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="My Progress" />
      <main className="p-6 space-y-6">

        {/* Top row: overall + skills */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-serif">Overall Score</CardTitle>
              <CardDescription>Your average across all skills</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-primary/10">
                <div className="text-center">
                  <p className="font-serif text-4xl font-bold text-primary">{data.average}%</p>
                  <p className="text-xs text-muted-foreground">Average</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Badge className="text-sm px-3 py-1">{data.currentLevel}</Badge>
                <span className="text-sm text-muted-foreground">Current Level</span>
              </div>
              {/* Level progress bar */}
              <div className="mt-4 w-full space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span>
                </div>
                <Progress value={data.average} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif">Skills Breakdown</CardTitle>
              <CardDescription>Your progress in each area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {data.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="font-bold text-primary">{skill.value}%</span>
                  </div>
                  <Progress value={skill.value} className="h-2.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent feedback */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent lesson evaluations */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Recent Lesson Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentEvaluations.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No evaluations yet</p>
              ) : (
                <div className="space-y-3">
                  {data.recentEvaluations.map((e) => (
                    <div key={e._id} className="rounded-lg border border-border p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-medium text-sm">{e.lessonId?.title || 'Lesson'}</p>
                        <Badge variant="outline">{e.teacherScore}/10</Badge>
                      </div>
                      {e.teacherFeedback && (
                        <p className="text-xs text-muted-foreground">{e.teacherFeedback}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(e.teacherEvaluatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent homework grades */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Homework Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentHomework.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No graded homework yet</p>
              ) : (
                <div className="space-y-3">
                  {data.recentHomework.map((h) => (
                    <div key={h._id} className="rounded-lg border border-border p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-medium text-sm">{h.title}</p>
                        {h.score && <Badge variant="outline">{h.score}/10</Badge>}
                      </div>
                      {h.feedback && (
                        <p className="text-xs text-muted-foreground">{h.feedback}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(h.gradedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}