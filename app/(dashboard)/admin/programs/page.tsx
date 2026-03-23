// app/(dashboard)/admin/programs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react'

type Program = {
  _id: string
  nameEn: string
  nameRo?: string
  nameRu?: string
  descriptionEn?: string
  price: number
  level?: string
  duration?: string
  active: boolean
  order: number
}

export default function AdminProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/programs')
      const data = await res.json()
      setPrograms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return
    try {
      await fetch(`/api/programs/${id}`, { method: 'DELETE' })
      fetchPrograms()
    } catch (error) {
      console.error('Error deleting program:', error)
    }
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Programs Management" />
        <main className="p-6 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Programs Management" />
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Manage programs and their lessons
          </p>
          <Button onClick={() => router.push('/admin/programs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No programs yet. Create your first program!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program._id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-serif text-xl">{program.nameEn}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {program.descriptionEn}
                      </CardDescription>
                    </div>
                    <Badge variant={program.active ? 'default' : 'secondary'}>
                      {program.active ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-3 text-sm">
                    <span className="text-muted-foreground">Level: {program.level || '—'}</span>
                    <span className="text-muted-foreground">Duration: {program.duration || '—'}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-primary">€{program.price}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/programs/${program._id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(program._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/programs/${program._id}/lessons`)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Lessons
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}