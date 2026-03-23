'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useLocale } from '@/lib/locale-context'

export default function ForgotPasswordPage() {
  const { t } = useLocale()
  const a = t.auth

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    if (res.ok) setSent(true)
    else setError(t.common.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-semibold">ARTAMONOVA</span>
          </Link>
          <p className="text-sm text-muted-foreground">English Learning Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">{a.resetPassword}</CardTitle>
            <CardDescription>
              {sent ? a.resetCodeSent : a.resetSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="rounded-md bg-green-500/10 px-3 py-3 text-sm text-green-600 dark:text-green-400">
                  {a.resetCodeSentTo} <strong>{email}</strong>
                </p>
                <Button asChild className="w-full">
                  <Link href="/reset-password">{a.enterCode}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{a.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {a.sendCode}
                </Button>
              </form>
            )}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground hover:underline">
                ← {a.backToLogin}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}