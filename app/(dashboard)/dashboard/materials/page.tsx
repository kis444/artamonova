'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, FileText, Video, Link as LinkIcon, Lock, CheckCircle } from 'lucide-react'

type Material = {
  _id: string
  lessonId: string
  lessonNumber: number
  lessonTitle: string
  programName: string
  programId: string
  type: string
  title: string
  url: string
  description: string
}

type Lesson = {
  _id: string
  order: number
  titleEn: string
  isUnlocked: boolean
  isCompleted: boolean
  materials?: Material[]
}

type Program = {
  _id: string
  nameEn: string
  lessons: Lesson[]
}

export default function MaterialsPage() {
  const { data: session } = useSession()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string>('')

  useEffect(() => {
    if (!session?.user?.id) return

    Promise.all([
      fetch('/api/student/programs').then(res => res.json()),
      fetch('/api/student/lessons').then(res => res.json()),
      fetch('/api/student/materials').then(res => res.json()),
    ]).then(([programsData, lessonsData, materialsData]) => {
      // Combină datele
      const programsWithLessons = (programsData.programs || []).map((program: any) => {
        const programLessons = (lessonsData.lessons || []).filter(
          (lesson: any) => lesson.programId === program._id
        )
        const lessonsWithMaterials = programLessons.map((lesson: any) => ({
          ...lesson,
          materials: (materialsData.materials || []).filter(
            (m: any) => m.lessonId === lesson._id
          )
        }))
        return {
          ...program,
          lessons: lessonsWithMaterials.sort((a: any, b: any) => a.order - b.order)
        }
      })

      setPrograms(programsWithLessons)
      if (programsWithLessons.length > 0) {
        setSelectedProgram(programsWithLessons[0]._id)
      }
      setLoading(false)
    }).catch((err) => {
      console.error('Error loading data:', err)
      setLoading(false)
    })
  }, [session])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-500" />
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />
      default: return <LinkIcon className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusIcon = (lesson: Lesson) => {
    if (lesson.isCompleted) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (!lesson.isUnlocked) {
      return <Lock className="h-4 w-4 text-muted-foreground" />
    }
    return null
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Materials" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  if (programs.length === 0) {
    return (
      <>
        <DashboardHeader title="Materials" />
        <main className="p-6">
          <Card>
            <CardContent className="py-20 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No programs or lessons available yet.</p>
              <p className="text-sm mt-2">Complete lessons to unlock materials.</p>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  // Calculează statistici
  const totalLessons = programs.reduce((acc, p) => acc + p.lessons.length, 0)
  const completedLessons = programs.reduce((acc, p) => 
    acc + p.lessons.filter(l => l.isCompleted).length, 0
  )
  const unlockedLessons = programs.reduce((acc, p) => 
    acc + p.lessons.filter(l => l.isUnlocked).length, 0
  )

  return (
    <>
      <DashboardHeader title="Learning Materials" />
      <main className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{totalLessons}</p>
              <p className="text-sm text-muted-foreground">Total Lessons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{unlockedLessons}</p>
              <p className="text-sm text-muted-foreground">Unlocked Lessons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{completedLessons}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {programs.length > 0 ? (
          <Tabs value={selectedProgram} onValueChange={setSelectedProgram}>
            <TabsList className="mb-6 flex-wrap">
              {programs.map(program => (
                <TabsTrigger key={program._id} value={program._id}>
                  {program.nameEn}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {programs.map(program => (
              <TabsContent key={program._id} value={program._id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">{program.nameEn}</CardTitle>
                    <CardDescription>
                      Materials are unlocked as you complete lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {program.lessons.map((lesson) => {
                        const hasMaterials = lesson.materials && lesson.materials.length > 0
                        const isUnlocked = lesson.isUnlocked
                        const isCompleted = lesson.isCompleted
                        
                        return (
                          <div key={lesson._id} className="rounded-lg border overflow-hidden">
                            <div className={`flex items-center justify-between p-4 ${
                              isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''
                            }`}>
                              <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                  isCompleted ? 'bg-green-500 text-white' :
                                  isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {lesson.order}
                                </div>
                                <div>
                                  <p className="font-medium">{lesson.titleEn}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(lesson)}
                                    <span className="text-xs text-muted-foreground">
                                      {isCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}
                                    </span>
                                    {hasMaterials && (
                                      <span className="text-xs text-muted-foreground">
                                        • {lesson.materials!.length} material{lesson.materials!.length !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Materials list - only show if unlocked */}
                            {isUnlocked && hasMaterials && lesson.materials && (
                              <div className="border-t bg-muted/30 p-4 space-y-2">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Materials:</p>
                                {lesson.materials.map((material, idx) => (
                                  <a
                                    key={material._id || idx}
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between rounded-lg bg-background p-3 transition-colors hover:bg-primary/5"
                                  >
                                    <div className="flex items-center gap-3">
                                      {getTypeIcon(material.type)}
                                      <div>
                                        <p className="font-medium text-sm">{material.title}</p>
                                        {material.description && (
                                          <p className="text-xs text-muted-foreground">{material.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                  </a>
                                ))}
                              </div>
                            )}
                            
                            {/* Locked message */}
                            {!isUnlocked && hasMaterials && (
                              <div className="border-t bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Complete previous lessons to unlock materials
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {program.lessons.length === 0 && (
                        <p className="py-8 text-center text-muted-foreground">
                          No lessons in this program yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No programs available.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}