'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function StudentSettingsPage() {
  const { data: session, update } = useSession()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load current user data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
    }
    // Fetch phone from DB
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user?.phone) setPhone(data.user.phone) })
      .catch(() => {})
  }, [session])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setProfileLoading(true)
    setProfileMsg(null)

    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    })
    const data = await res.json()
    setProfileLoading(false)

    if (res.ok) {
      setProfileMsg({ type: 'success', text: '✅ Profile saved successfully!' })
      await update({ name }) // update NextAuth session
      setTimeout(() => setProfileMsg(null), 3000)
    } else {
      setProfileMsg({ type: 'error', text: data.error || 'Failed to save' })
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setPwLoading(true)
    setPwMsg(null)

    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setPwLoading(false)

    if (res.ok) {
      setPwMsg({ type: 'success', text: '✅ Password changed successfully!' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPwMsg(null), 3000)
    } else {
      setPwMsg({ type: 'error', text: data.error || 'Failed to change password' })
    }
  }

  return (
    <>
      <DashboardHeader title="Settings" />
      <main className="p-6">
        <div className="max-w-xl space-y-6">

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+40 123 456 789" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session?.user?.email || ''} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                {profileMsg && (
                  <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${profileMsg.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                    {profileMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {profileMsg.text}
                  </div>
                )}

                <Button type="submit" disabled={profileLoading || !name.trim()}>
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
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
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                </div>

                {pwMsg && (
                  <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${pwMsg.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                    {pwMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {pwMsg.text}
                  </div>
                )}

                <Button type="submit" variant="outline" disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}>
                  {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}