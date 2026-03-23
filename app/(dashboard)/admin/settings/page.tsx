'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bell, Calendar, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type DayAvailability = {
  dayOfWeek: number; startTime: string; endTime: string; isActive: boolean
}

export default function AdminSettingsPage() {
  const { t } = useLocale()
  const { data: session, update } = useSession()
  const router = useRouter()

  // Profile
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Availability
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map((_, i) => ({
      dayOfWeek: i + 1,
      startTime: '09:00',
      endTime: '18:00',
      isActive: i < 5,
    }))
  )
  const [availLoading, setAvailLoading] = useState(false)
  const [availMsg, setAvailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

useEffect(() => {
  if (session?.user) setName(session.user.name || '')

  // Load phone from DB (not stored in session)
  fetch('/api/user/profile')
    .then(r => r.ok ? r.json() : null)
.then(data => { 
  if (data?.phone !== undefined) setPhone(data.phone || '')
  if (data?.name) setName(data.name)
})    .catch(() => {})

  // Load availability from DB
  fetch('/api/admin/availability')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setAvailability(DAYS.map((_, i) => {
          const saved = data.find((d: any) => d.dayOfWeek === i + 1)
          return saved
            ? { dayOfWeek: i + 1, startTime: saved.startTime, endTime: saved.endTime, isActive: saved.isActive }
            : { dayOfWeek: i + 1, startTime: '09:00', endTime: '18:00', isActive: i < 5 }
        }))
      }
    })
    .catch(() => {})
}, [session])

async function handleProfileSave(e: React.FormEvent) {
  e.preventDefault()
  setProfileLoading(true); setProfileMsg(null)
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  })
  const data = await res.json()
  setProfileLoading(false)

 if (res.ok) {
  setProfileMsg({ type: 'success', text: '✅ Profile saved!' })
  await update({ name })
  setName(name)
  setPhone(phone) // ← vine din state-ul local, e deja corect!
  setTimeout(() => setProfileMsg(null), 3000)
  // ȘTERGE window.location.reload()
}
}

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); return }
    if (newPassword.length < 8) { setPwMsg({ type: 'error', text: 'Min. 8 characters' }); return }
    setPwLoading(true); setPwMsg(null)
    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setPwLoading(false)
    if (res.ok) {
      setPwMsg({ type: 'success', text: '✅ Password changed!' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPwMsg(null), 3000)
    } else {
      setPwMsg({ type: 'error', text: data.error || 'Failed' })
    }
  }

  async function handleAvailabilitySave() {
    setAvailLoading(true); setAvailMsg(null)
    const res = await fetch('/api/admin/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: availability }),
    })
    setAvailLoading(false)
    if (res.ok) {
      setAvailMsg({ type: 'success', text: '✅ Availability saved!' })
      setTimeout(() => setAvailMsg(null), 3000)
    } else {
      setAvailMsg({ type: 'error', text: 'Failed to save' })
    }
  }

  function updateDay(idx: number, field: keyof DayAvailability, value: any) {
    setAvailability(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  const Msg = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) =>
    msg ? (
      <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${msg.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
        {msg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        {msg.text}
      </div>
    ) : null

  return (
    <>
      <DashboardHeader title={t.dashboard.admin.settings} />
      <main className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="availability" className="gap-2"><Calendar className="h-4 w-4" />Availability</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Personal Information</CardTitle>
                  <CardDescription>Update your name and contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+40 123 456 789" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={session?.user?.email || ''} disabled className="opacity-60" />
                    </div>
                    <Msg msg={profileMsg} />
                    <Button type="submit" disabled={profileLoading || !name?.trim()}>
                      {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Change Password</CardTitle>
                  <CardDescription>Update your login password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                    </div>
                    <Msg msg={pwMsg} />
                    <Button type="submit" variant="outline" disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}>
                      {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AVAILABILITY */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Working Hours</CardTitle>
                <CardDescription>Set your available days and hours for lessons. This affects the booking calendar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {DAYS.map((day, i) => (
                    <div key={day} className={`rounded-lg border p-3 transition-opacity ${!availability[i]?.isActive ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={availability[i]?.isActive || false}
                            onCheckedChange={v => updateDay(i, 'isActive', v)}
                          />
                          <span className="font-medium w-24">{day}</span>
                        </div>
                        {availability[i]?.isActive && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={availability[i]?.startTime || '09:00'}
                              onChange={e => updateDay(i, 'startTime', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">—</span>
                            <Input
                              type="time"
                              value={availability[i]?.endTime || '18:00'}
                              onChange={e => updateDay(i, 'endTime', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Msg msg={availMsg} />
                <Button onClick={handleAvailabilitySave} disabled={availLoading}>
                  {availLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> Save Availability
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'New Booking', desc: 'When a student books a lesson' },
                  { label: 'Lesson Reminder', desc: '30 minutes before each lesson' },
                  { label: 'Homework Submission', desc: 'When a student submits homework' },
                  { label: 'Payment Received', desc: 'For successful payments' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
                <Button onClick={() => {}}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}