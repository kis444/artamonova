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
  materials: Material[]
  programName: string
}

type LessonResponse = {
  _id: string
  order: number
  titleEn: string
  isUnlocked: boolean
  isCompleted: boolean
  programName?: string
  programId?: string
}

export default function MaterialsPage() {
  const { data: session } = useSession()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [programs, setPrograms] = useState<string[]>([])

  useEffect(() => {
    if (!session?.user?.id) return

    Promise.all([
      fetch('/api/student/lessons').then(res => res.json()),
      fetch('/api/student/materials').then(res => res.json()),
    ]).then(([lessonsData, materialsData]) => {
      const allLessons: LessonResponse[] = lessonsData.lessons || []
      const materialsList: Material[] = materialsData.materials || []
      
      // Grupează materialele după lessonId
      const materialsByLesson: Record<string, Material[]> = {}
      materialsList.forEach((m: Material) => {
        if (!materialsByLesson[m.lessonId]) {
          materialsByLesson[m.lessonId] = []
        }
        materialsByLesson[m.lessonId].push(m)
      })

      // Construiește lecțiile cu materiale
      const lessonsWithMaterials: Lesson[] = allLessons
        .map((lesson: LessonResponse) => ({
          _id: lesson._id,
          order: lesson.order,
          titleEn: lesson.titleEn,
          isUnlocked: lesson.isUnlocked,
          isCompleted: lesson.isCompleted,
          programName: lesson.programName || '',
          materials: materialsByLesson[lesson._id] || []
        }))
        .filter((lesson: Lesson) => lesson.materials.length > 0)

      // Extrage programele unice
      const uniquePrograms: string[] = [...new Set(lessonsWithMaterials.map((l: Lesson) => l.programName))]
      
      setLessons(lessonsWithMaterials)
      setPrograms(uniquePrograms)
      if (uniquePrograms.length > 0) {
        setSelectedProgram(uniquePrograms[0])
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

  if (lessons.length === 0) {
    return (
      <>
        <DashboardHeader title="Materials" />
        <main className="p-6">
          <Card>
            <CardContent className="py-20 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No materials available yet.</p>
              <p className="text-sm mt-2">Materials will appear here once your teacher adds them.</p>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Learning Materials" />
      <main className="p-6">
        {programs.length > 0 ? (
          <Tabs value={selectedProgram} onValueChange={setSelectedProgram}>
            <TabsList className="mb-6 flex-wrap">
              {programs.map((program: string) => (
                <TabsTrigger key={program} value={program}>
                  {program}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {programs.map((program: string) => (
              <TabsContent key={program} value={program}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">{program}</CardTitle>
                    <CardDescription>
                      Learning materials from your lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {lessons
                        .filter((lesson: Lesson) => lesson.programName === program)
                        .map((lesson: Lesson) => {
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
                                      <span className="text-xs text-muted-foreground">
                                        {isCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        • {lesson.materials.length} material{lesson.materials.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Materials list - only show if unlocked */}
                              {isUnlocked && (
                                <div className="border-t bg-muted/30 p-4 space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Materials:</p>
                                  {lesson.materials.map((material: Material, idx: number) => (
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
                              {!isUnlocked && (
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
              <p>No materials available.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}