'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Video, Save, Copy } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Student = {
  _id: string
  name: string
  email: string
  phone: string
  level: string
  program: string
  permanentMeetLink: string
  status: string
}

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [meetLink, setMeetLink] = useState('')

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  const fetchStudent = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students/${studentId}`)
      const data = await res.json()
      setStudent(data)
      setMeetLink(data.permanentMeetLink || '')
    } catch (error) {
      console.error('Error fetching student:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMeetLink = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permanentMeetLink: meetLink }),
      })
      if (res.ok) {
        toast({ title: 'Saved!', description: 'Meeting link updated' })
      } else {
        toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetLink)
    toast({ title: 'Copied!', description: 'Link copied to clipboard' })
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Edit Student" />
        <main className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </>
    )
  }

  if (!student) {
    return (
      <>
        <DashboardHeader title="Edit Student" />
        <main className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Student not found</p>
              <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title={`Edit: ${student.name}`} />
      <main className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>← Back</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Student Information</CardTitle>
              <CardDescription>{student.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{student.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-medium">{student.level || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Program</p>
                <p className="font-medium">{student.program || '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Permanent Meet Link */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Permanent Meeting Link
              </CardTitle>
              <CardDescription>
                Set a permanent Google Meet link for this student. They will use this for all lessons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Meet Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  />
                  {meetLink && (
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Create a permanent link in Google Meet: "New meeting" → "Create a meeting for later" → Copy link
                </p>
              </div>
              <Button onClick={handleSaveMeetLink} disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Meeting Link
              </Button>
              {student.permanentMeetLink && (
                <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Current link:</p>
                  <a
                    href={student.permanentMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {student.permanentMeetLink}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-serif">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Create a permanent Google Meet link: go to meet.google.com → "New meeting" → "Create a meeting for later"</p>
            <p>2. Paste the link above and save</p>
            <p>3. The student will see a "Join Lesson" button in their dashboard using this link</p>
            <p>4. For trial lessons (new students), you can create a temporary link and update it here</p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}