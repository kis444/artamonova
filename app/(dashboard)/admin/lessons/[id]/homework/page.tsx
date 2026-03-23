'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Loader2, FileText, HelpCircle, PenTool, Mic } from 'lucide-react'
import Link from 'next/link'

type Template = {
  _id: string
  type: 'quiz' | 'writing' | 'audio' | 'file'
  title: string
  description: string
  dueDays: number
  order: number
  questions?: any[]
  prompt?: string
  wordLimit?: number
}

export default function LessonHomeworkPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<{ titleEn: string } | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/lessons/${lessonId}/homework`)
      .then(res => res.json())
      .then(data => {
        setLesson(data.lesson)
        setTemplates(data.templates)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lessonId])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      case 'writing': return <PenTool className="h-4 w-4" />
      case 'audio': return <Mic className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Quiz'
      case 'writing': return 'Writing'
      case 'audio': return 'Audio'
      default: return 'File'
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Delete this homework assignment?')) return
    await fetch(`/api/admin/lessons/${lessonId}/homework?templateId=${templateId}`, {
      method: 'DELETE'
    })
    setTemplates(prev => prev.filter(t => t._id !== templateId))
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Homework Templates" />
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
          <div>
            <Button variant="outline" asChild className="mr-2">
              <Link href="/admin/lessons">← Back to Lessons</Link>
            </Button>
          </div>
          <Button asChild>
            <Link href={`/admin/lessons/${lessonId}/homework/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Homework
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Homework Assignments</CardTitle>
            <CardDescription>
              Manage homework for this lesson. Students will receive assignments when they unlock the lesson.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No homework assignments yet. Click "Add Homework" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template._id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {getTypeIcon(template.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{template.title}</p>
                          <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            Due in {template.dueDays} days
                          </Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                        {template.type === 'quiz' && template.questions && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.questions.length} questions
                          </p>
                        )}
                        {template.type === 'writing' && template.wordLimit && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Word limit: {template.wordLimit}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/lessons/${lessonId}/homework/${template._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(template._id)} className="text-destructive">
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