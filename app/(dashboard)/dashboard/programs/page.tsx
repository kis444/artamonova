'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, BookOpen, Euro, Clock, PlusCircle, CheckCircle, BarChart3 } from 'lucide-react'

type EnrolledProgram = {
  _id: string; nameEn: string; level: string; duration: string
  price: number; descriptionEn: string; currentLessonNumber: number; startedAt: string
}
type AvailableProgram = { _id: string; nameEn: string; level: string; duration: string; price: number; descriptionEn: string }
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function StudentProgramsPage() {
  const { data: session } = useSession()
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>([])
  const [availablePrograms, setAvailablePrograms] = useState<AvailableProgram[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterLevel, setFilterLevel] = useState('all')
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!session?.user?.id) return
    Promise.all([
      fetch('/api/student/programs').then(r => r.json()),
      fetch('/api/programs').then(r => r.json()),
    ]).then(([enrolledData, allData]) => {
      const enrolled = enrolledData.programs || []
      setEnrolledPrograms(enrolled)
      setAvailablePrograms(Array.isArray(allData) ? allData.filter((p: any) => p.active !== false) : [])
      setEnrolledIds(new Set(enrolled.map((p: any) => p._id)))
      setLoading(false)
      enrolled.forEach(async (p: EnrolledProgram) => {
        try {
          const res = await fetch(`/api/student/lessons?programId=${p._id}`)
          const data = await res.json()
          setLessonCounts(prev => ({ ...prev, [p._id]: data.lessons?.length || 0 }))
        } catch {}
      })
    }).catch(() => setLoading(false))
  }, [session])

  async function handleEnroll(programId: string) {
    setEnrolling(programId); setMessage(null)
    const res = await fetch('/api/student/enroll', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId }),
    })
    const data = await res.json()
    setEnrolling(null)
    if (res.ok) {
      setEnrolledIds(prev => new Set([...prev, programId]))
      setMessage({ type: 'success', text: '✅ Enrolled! Go to My Lessons to start.' })
      setTimeout(() => setMessage(null), 4000)
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to enroll' })
    }
  }

  const filteredAvailable = filterLevel === 'all' ? availablePrograms : availablePrograms.filter(p => p.level.includes(filterLevel))

  if (loading) return (
    <>
      <DashboardHeader title="Programs" />
      <main className="p-6 flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
    </>
  )

  return (
    <>
      <DashboardHeader title="Programs" />
      <main className="p-6">
        {message && (
          <div className={`mb-6 rounded-lg p-4 text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            {message.text}
          </div>
        )}
        <Tabs defaultValue={enrolledPrograms.length > 0 ? 'enrolled' : 'available'}>
          <TabsList className="mb-6">
            <TabsTrigger value="enrolled">My Programs <span className="ml-2 rounded-full bg-primary/10 px-2 text-xs text-primary">{enrolledPrograms.length}</span></TabsTrigger>
            <TabsTrigger value="available">All Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled">
            {enrolledPrograms.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p className="mb-4">Not enrolled yet.</p>
                <Button asChild><Link href="/placement-test">Take Placement Test</Link></Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {enrolledPrograms.map(p => {
                  const total = lessonCounts[p._id] || 0
                  const done = p.currentLessonNumber || 0
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <Card key={p._id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="font-serif text-xl">{p.nameEn}</CardTitle>
                            <Badge variant="outline" className="mt-1">{p.level}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Since {new Date(p.startedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{done}/{total} lessons</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">{pct}% complete</p>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1" asChild>
                            <Link href={`/dashboard/lessons?programId=${p._id}`}>Continue Learning</Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/progress"><BarChart3 className="h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available">
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant={filterLevel === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterLevel('all')}>All</Button>
              {LEVELS.map(l => <Button key={l} variant={filterLevel === l ? 'default' : 'outline'} size="sm" onClick={() => setFilterLevel(l)}>{l}</Button>)}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAvailable.map(p => {
                const isEnrolled = enrolledIds.has(p._id)
                return (
                  <Card key={p._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="font-serif text-xl">{p.nameEn}</CardTitle>
                      <CardDescription className="line-clamp-2">{p.descriptionEn}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="outline">{p.level}</Badge>
                        <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{p.duration}</span>
                        <span className="flex items-center gap-1 font-medium text-primary"><Euro className="h-3 w-3" />€{p.price}</span>
                      </div>
                      {isEnrolled ? (
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full" disabled>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Enrolled
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href={`/dashboard/lessons?programId=${p._id}`}>Go to Lessons →</Link>
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" onClick={() => handleEnroll(p._id)} disabled={enrolling === p._id}>
                          {enrolling === p._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                          Enroll Now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}