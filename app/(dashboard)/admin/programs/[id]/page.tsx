'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

type Program = {
  _id: string
  nameEn: string
  nameRo: string
  nameRu: string
  descriptionEn: string
  descriptionRo: string
  descriptionRu: string
  price: number
  level: string
  duration: string
  active: boolean
  order: number
}

export default function EditProgramPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Program>>({})

  useEffect(() => {
    fetch(`/api/programs/${programId}`)
      .then(res => res.json())
      .then(data => {
        setForm(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [programId])

  const setField = (field: keyof Program, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.nameEn) return
    setSaving(true)
    const res = await fetch(`/api/programs/${programId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/admin/programs')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Edit Program" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Edit Program" />
      <main className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/admin/programs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Program Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (€)</Label>
                <Input
                  type="number"
                  value={form.price || ''}
                  onChange={(e) => setField('price', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Input
                  value={form.level || ''}
                  onChange={(e) => setField('level', e.target.value)}
                  placeholder="A1-C2"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={form.duration || ''}
                  onChange={(e) => setField('duration', e.target.value)}
                  placeholder="60 min"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Active (visible on site)</span>
              <Switch
                checked={form.active || false}
                onCheckedChange={(v) => setField('active', v)}
              />
            </div>

            <Tabs defaultValue="en">
              <TabsList className="w-full">
                <TabsTrigger value="en" className="flex-1">🇬🇧 English *</TabsTrigger>
                <TabsTrigger value="ro" className="flex-1">🇷🇴 Română</TabsTrigger>
                <TabsTrigger value="ru" className="flex-1">🇷🇺 Русский</TabsTrigger>
              </TabsList>
              {(['en', 'ro', 'ru'] as const).map((lang) => {
                const cap = lang.charAt(0).toUpperCase() + lang.slice(1)
                return (
                  <TabsContent key={lang} value={lang} className="space-y-3 mt-3">
                    <div className="space-y-2">
                      <Label>Name {lang === 'en' ? '(required)' : ''}</Label>
                      <Input
                        value={(form as any)[`name${cap}`] || ''}
                        onChange={(e) => setField(`name${cap}` as keyof Program, e.target.value)}
                        placeholder={`Program name in ${lang === 'en' ? 'English' : lang === 'ro' ? 'Romanian' : 'Russian'}...`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={(form as any)[`description${cap}`] || ''}
                        onChange={(e) => setField(`description${cap}` as keyof Program, e.target.value)}
                        placeholder="Describe this program..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push('/admin/programs')}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
