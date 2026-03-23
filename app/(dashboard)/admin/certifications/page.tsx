'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Award, ExternalLink, Trash2, Edit, Loader2 } from 'lucide-react'

type Cert = {
  _id: string; name: string; issuer: string; year: string
  pdfUrl: string; externalUrl: string
}

const emptyForm = { name: '', issuer: '', year: '', pdfUrl: '', externalUrl: '' }

export default function AdminCertificationsPage() {
  const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/certifications')
      .then((r) => r.json())
      .then((data) => { setCerts(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  function openNew() { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }

  function openEdit(c: Cert) {
    setEditingId(c._id)
    setForm({ name: c.name, issuer: c.issuer, year: c.year, pdfUrl: c.pdfUrl, externalUrl: c.externalUrl })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.issuer || !form.year) return
    setSaving(true)
    const url = editingId ? `/api/certifications/${editingId}` : '/api/certifications'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      if (editingId) setCerts((prev) => prev.map((c) => c._id === editingId ? data : c))
      else setCerts((prev) => [...prev, data])
      setDialogOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certification?')) return
    await fetch(`/api/certifications/${id}`, { method: 'DELETE' })
    setCerts((prev) => prev.filter((c) => c._id !== id))
  }

  const setF = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <>
      <DashboardHeader title="Certifications" />
      <main className="p-6">
        <div className="mb-6 flex justify-end">
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Certification
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">My Certifications</CardTitle>
            <CardDescription>{certs.length} certifications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /><span>Loading...</span>
              </div>
            ) : certs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Award className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No certifications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certs.map((c) => (
                  <div key={c._id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.issuer} · {c.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {(c.pdfUrl || c.externalUrl) && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={c.pdfUrl || c.externalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">{editingId ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Certificate Name *</Label>
                <Input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="e.g., CELTA Certificate" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issuer *</Label>
                  <Input value={form.issuer} onChange={(e) => setF('issuer', e.target.value)} placeholder="e.g., Cambridge English" />
                </div>
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input value={form.year} onChange={(e) => setF('year', e.target.value)} placeholder="2024" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>PDF URL (optional)</Label>
                <Input value={form.pdfUrl} onChange={(e) => setF('pdfUrl', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>External URL (optional)</Label>
                <Input value={form.externalUrl} onChange={(e) => setF('externalUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.issuer || !form.year || saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}