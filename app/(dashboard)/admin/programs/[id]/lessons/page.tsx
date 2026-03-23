'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Loader2, BookOpen, FileText, Calendar, Clock } from 'lucide-react'

type Lesson = {
  _id: string
  lessonNumber: number
  titleEn: string
  titleRo: string
  titleRu: string
  descriptionEn: string
  skills: string[]
  duration: number
  active: boolean
  materials?: any[]
}

export default function ProgramLessonsPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  const [program, setProgram] = useState<{ nameEn: string } | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Folosește API-ul corect
    fetch(`/api/admin/programs/${programId}/lessons`)
      .then(res => res.json())
      .then(data => {
        console.log('Loaded lessons:', data) // pentru debugging
        setLessons(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading lessons:', err)
        setLoading(false)
      })
    
    // Încarcă și programul
    fetch(`/api/programs/${programId}`)
      .then(res => res.json())
      .then(data => setProgram(data))
      .catch(console.error)
  }, [programId])

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' })
    if (res.ok) {
      setLessons(prev => prev.filter(l => l._id !== lessonId))
    }
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Lessons" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title={`Lessons: ${program?.nameEn || 'Program'}`} />
      <main className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/admin/programs">← Back to Programs</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/programs/${programId}/lessons/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Course Lessons</CardTitle>
            <CardDescription>
              Lessons will be unlocked when students book them. Each lesson has its own materials and homework.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No lessons yet. Click "Add Lesson" to create your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                        {lesson.lessonNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lesson.titleEn}</p>
                          {!lesson.active && <Badge variant="secondary">Draft</Badge>}
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.duration} min
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{lesson.descriptionEn}</p>
                        <div className="flex gap-2 mt-1">
                          {lesson.skills?.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs capitalize">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {lesson.materials?.length || 0} materials
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/programs/${programId}/lessons/${lesson._id}/materials`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/programs/${programId}/lessons/${lesson._id}/homework`}>
                          <Calendar className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/programs/${programId}/lessons/${lesson._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson._id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
