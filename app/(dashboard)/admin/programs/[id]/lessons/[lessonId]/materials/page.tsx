'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, ExternalLink, FileText, Video, Link as LinkIcon } from 'lucide-react'

type Material = {
  type: 'pdf' | 'link' | 'video' | 'drive'
  title: string
  url: string
  description?: string
}

export default function LessonMaterialsPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<{ titleEn: string } | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/lessons/${lessonId}`).then(r => r.json()),
      fetch(`/api/admin/lessons/${lessonId}/materials`).then(r => r.json()),
    ]).then(([lessonData, materialsData]) => {
      setLesson(lessonData)
      setMaterials(materialsData || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [lessonId])

  const addMaterial = () => {
    setMaterials([...materials, { type: 'link', title: '', url: '', description: '' }])
  }

  const updateMaterial = (index: number, field: keyof Material, value: string) => {
    const newMaterials = [...materials]
    newMaterials[index] = { ...newMaterials[index], [field]: value }
    setMaterials(newMaterials)
  }

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/lessons/${lessonId}/materials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materials }),
    })
    if (res.ok) {
      router.push(`/admin/programs/${programId}/lessons`)
    }
    setSaving(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />
      case 'video': return <Video className="h-4 w-4 text-blue-500" />
      case 'drive': return <LinkIcon className="h-4 w-4 text-green-500" />
      default: return <ExternalLink className="h-4 w-4 text-purple-500" />
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

  return (
    <>
      <DashboardHeader title={`Materials: ${lesson?.titleEn || 'Lesson'}`} />
      <main className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>← Back to Lessons</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Lesson Materials</CardTitle>
            <CardDescription>
              Students will see these materials when the lesson is unlocked (at the scheduled time).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {materials.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No materials yet. Click "Add Material" to add PDFs, links, or videos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((material, idx) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        <span className="text-sm font-medium capitalize">{material.type}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMaterial(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={material.type}
                        onChange={e => updateMaterial(idx, 'type', e.target.value)}
                        className="rounded-md border bg-background p-2 text-sm"
                      >
                        <option value="link">Link</option>
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                        <option value="drive">Google Drive</option>
                      </select>
                      <Input
                        value={material.title}
                        onChange={e => updateMaterial(idx, 'title', e.target.value)}
                        placeholder="Title"
                      />
                    </div>
                    <Input
                      value={material.url}
                      onChange={e => updateMaterial(idx, 'url', e.target.value)}
                      placeholder="URL or file path"
                    />
                    <Input
                      value={material.description || ''}
                      onChange={e => updateMaterial(idx, 'description', e.target.value)}
                      placeholder="Description (optional)"
                    />
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={addMaterial} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Material
            </Button>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Materials
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}