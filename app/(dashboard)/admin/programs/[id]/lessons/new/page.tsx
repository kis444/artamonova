'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, X } from 'lucide-react'

const SKILLS = ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading']

export default function NewLessonPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  const [lessonNumber, setLessonNumber] = useState<number>(0) // 0 = auto
  const [titleEn, setTitleEn] = useState('')
  const [titleRo, setTitleRo] = useState('')
  const [titleRu, setTitleRu] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionRo, setDescriptionRo] = useState('')
  const [descriptionRu, setDescriptionRu] = useState('')
  const [duration, setDuration] = useState(60)
  const [skills, setSkills] = useState<string[]>([])
  const [active, setActive] = useState(true)

  const [saving, setSaving] = useState(false)

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const handleSave = async () => {
    if (!titleEn) return
    setSaving(true)

    const res = await fetch(`/api/admin/programs/${programId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonNumber: lessonNumber === 0 ? undefined : lessonNumber,
        titleEn,
        titleRo,
        titleRu,
        descriptionEn,
        descriptionRo,
        descriptionRu,
        duration,
        skills,
        active,
      }),
    })

    if (res.ok) {
      router.push(`/admin/programs/${programId}/lessons`)
    }
    setSaving(false)
  }

  return (
    <>
      <DashboardHeader title="Add Lesson" />
      <main className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>← Back</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Create New Lesson</CardTitle>
            <CardDescription>Define lesson content and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lesson Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lesson Number</Label>
                <Input 
                  type="number" 
                  value={lessonNumber} 
                  onChange={e => setLessonNumber(Number(e.target.value))} 
                  placeholder="0 = auto-assign" 
                />
                <p className="text-xs text-muted-foreground">Leave 0 for automatic numbering</p>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
              </div>
            </div>

            {/* Title in 3 languages */}
            <Tabs defaultValue="en">
              <TabsList className="w-full">
                <TabsTrigger value="en" className="flex-1">🇬🇧 English *</TabsTrigger>
                <TabsTrigger value="ro" className="flex-1">🇷🇴 Română</TabsTrigger>
                <TabsTrigger value="ru" className="flex-1">🇷🇺 Русский</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label>Title (English) *</Label>
                  <Input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Lesson title" />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={3} placeholder="Lesson description" />
                </div>
              </TabsContent>

              <TabsContent value="ro" className="space-y-4">
                <div className="space-y-2">
                  <Label>Title (Romanian)</Label>
                  <Input value={titleRo} onChange={e => setTitleRo(e.target.value)} placeholder="Titlul lecției" />
                </div>
                <div className="space-y-2">
                  <Label>Description (Romanian)</Label>
                  <Textarea value={descriptionRo} onChange={e => setDescriptionRo(e.target.value)} rows={3} placeholder="Descrierea lecției" />
                </div>
              </TabsContent>

              <TabsContent value="ru" className="space-y-4">
                <div className="space-y-2">
                  <Label>Title (Russian)</Label>
                  <Input value={titleRu} onChange={e => setTitleRu(e.target.value)} placeholder="Название урока" />
                </div>
                <div className="space-y-2">
                  <Label>Description (Russian)</Label>
                  <Textarea value={descriptionRu} onChange={e => setDescriptionRu(e.target.value)} rows={3} placeholder="Описание урока" />
                </div>
              </TabsContent>
            </Tabs>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills Covered</Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <Button
                    key={skill}
                    type="button"
                    variant={skills.includes(skill) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSkill(skill)}
                    className="capitalize"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Visible to students when lesson is booked</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleSave} disabled={!titleEn || saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}