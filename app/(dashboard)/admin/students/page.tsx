'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Search, Plus, MoreHorizontal, Mail, Phone, Edit, UserX, UserCheck, Loader2, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

type Student = {
  _id: string; name: string; email: string; phone: string
  level: string; program: string; status: 'active' | 'inactive'; createdAt: string
}

type Program = { _id: string; nameEn: string; level: string }

const emptyForm = { name: '', email: '', phone: '', password: '', level: '', program: '' }

export default function AdminStudentsPage() {
  const { t } = useLocale()
  const [students, setStudents] = useState<Student[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'active' | 'inactive'>('active')

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', level: '', program: '' })
  const [saving, setSaving] = useState(false)

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollStudent, setEnrollStudent] = useState<Student | null>(null)
  const [enrollProgramId, setEnrollProgramId] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/programs').then(r => r.json()),
    ]).then(([s, p]) => {
      setStudents(Array.isArray(s) ? s : [])
      setPrograms(Array.isArray(p) ? p : [])
      setLoading(false)
    })
  }, [])

  const activeStudents = students.filter(s =>
    s.status === 'active' &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase()))
  )
  const inactiveStudents = students.filter(s =>
    s.status === 'inactive' &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) return
    setAdding(true); setAddError('')
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setAdding(false)
    if (!res.ok) { setAddError(data.error || 'Error'); return }
    setStudents(prev => [data, ...prev])
    setAddOpen(false); setForm(emptyForm)
  }

  async function handleEdit() {
    if (!editStudent) return
    setSaving(true)
    const res = await fetch(`/api/students/${editStudent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    if (res.ok) {
      setStudents(prev => prev.map(s => s._id === editStudent._id ? { ...s, ...editForm } : s))
      setEditOpen(false)
    }
  }

  async function handleEnroll() {
    if (!enrollStudent || !enrollProgramId) return
    setEnrolling(true)
    const res = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: enrollStudent._id, programId: enrollProgramId }),
    })
    const data = await res.json()
    setEnrolling(false)
    if (res.ok) {
      setEnrollOpen(false); setEnrollProgramId('')
      alert(`✅ ${data.message}`)
    } else {
      alert(`❌ ${data.error}`)
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Move to ex-students?')) return
    await fetch(`/api/students/${id}`, { method: 'DELETE' })
    setStudents(prev => prev.map(s => s._id === id ? { ...s, status: 'inactive' } : s))
  }

  async function handleReactivate(id: string) {
    await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    setStudents(prev => prev.map(s => s._id === id ? { ...s, status: 'active' } : s))
  }

  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const setEF = (k: string, v: string) => setEditForm(p => ({ ...p, [k]: v }))

  const StudentTable = ({ list, showReactivate = false }: { list: Student[]; showReactivate?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-2 h-8 w-8 opacity-40" /><p>No students found</p>
            </TableCell>
          </TableRow>
        ) : list.map(s => (
          <TableRow key={s._id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-sm">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {s.phone ? (
                <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-sm hover:text-primary">
                  <Phone className="h-3 w-3" />{s.phone}
                </a>
              ) : <span className="text-muted-foreground text-sm">—</span>}
            </TableCell>
            <TableCell>
              {s.level ? <Badge variant="outline">{s.level}</Badge> : <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </TableCell>
            <TableCell>
              <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {/* View Progress */}
    <DropdownMenuItem asChild>
      <Link href={`/admin/students/${s._id}/progress`}>
        <BarChart3 className="mr-2 h-4 w-4" /> View Progress
      </Link>
    </DropdownMenuItem>
    
    <DropdownMenuItem asChild>
  <Link href={`/admin/students/${s._id}`}>
    <Edit className="mr-2 h-4 w-4" /> Edit Student
  </Link>
</DropdownMenuItem>
    
    <DropdownMenuItem onClick={() => { setEnrollStudent(s); setEnrollOpen(true) }}>
      <BookOpen className="mr-2 h-4 w-4" /> Enroll in Program
    </DropdownMenuItem>
    
    {s.phone && (
      <DropdownMenuItem asChild>
        <a href={`tel:${s.phone}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
      </DropdownMenuItem>
    )}
    
    <DropdownMenuItem asChild>
      <a href={`mailto:${s.email}`}><Mail className="mr-2 h-4 w-4" /> Email</a>
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    {showReactivate ? (
      <DropdownMenuItem onClick={() => handleReactivate(s._id)}>
        <UserCheck className="mr-2 h-4 w-4 text-green-600" /><span className="text-green-600">Reactivate</span>
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem onClick={() => handleDeactivate(s._id)}>
        <UserX className="mr-2 h-4 w-4 text-destructive" /><span className="text-destructive">Move to Ex-Students</span>
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <>
      <DashboardHeader title={t.dashboard.admin.students} />
      <main className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Students</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{students.filter(s => s.status === 'inactive').length}</p><p className="text-sm text-muted-foreground">Ex-Students</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{students.length}</p><p className="text-sm text-muted-foreground">Total All Time</p></CardContent></Card>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="relative max-w-sm flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
  </div>
  <div className="flex gap-2">
    <Button variant="outline" asChild>
      <a href="/api/admin/export" download>
        📊 Export CSV
      </a>
    </Button>
    <Button onClick={() => setAddOpen(true)}>
      <Plus className="mr-2 h-4 w-4" /> Add Student
    </Button>
  </div>
</div>

        <Tabs value={tab} onValueChange={v => setTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active ({activeStudents.length})</TabsTrigger>
            <TabsTrigger value="inactive">Ex-Students ({inactiveStudents.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <Card><CardContent>{loading ? <div className="flex items-center gap-2 py-8"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading...</span></div> : <StudentTable list={activeStudents} />}</CardContent></Card>
          </TabsContent>
          <TabsContent value="inactive">
            <Card><CardContent>{loading ? <div className="flex items-center gap-2 py-8"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading...</span></div> : <StudentTable list={inactiveStudents} showReactivate />}</CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* Add Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Add Student</DialogTitle><DialogDescription>Create a new student account</DialogDescription></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Maria Ionescu" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+40 123 456 789" /></div>
              </div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="student@email.com" /></div>
              <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setF('password', e.target.value)} placeholder="Min. 8 characters" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Level</Label><Input value={form.level} onChange={e => setF('level', e.target.value)} placeholder="B2" /></div>
                <div className="space-y-2"><Label>Program</Label><Input value={form.program} onChange={e => setF('program', e.target.value)} placeholder="General English" /></div>
              </div>
              {addError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{addError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAddOpen(false); setAddError('') }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!form.name || !form.email || !form.password || adding}>
                {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Edit Student</DialogTitle><DialogDescription>{editStudent?.email}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={editForm.name} onChange={e => setEF('name', e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEF('phone', e.target.value)} placeholder="+40 123 456 789" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Level</Label><Input value={editForm.level} onChange={e => setEF('level', e.target.value)} placeholder="B2" /></div>
                <div className="space-y-2"><Label>Program</Label><Input value={editForm.program} onChange={e => setEF('program', e.target.value)} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enroll Dialog */}
        <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Enroll in Program</DialogTitle>
              <DialogDescription>{enrollStudent?.name} — select a program to enroll</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={enrollProgramId} onValueChange={setEnrollProgramId}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.nameEn} — Level {p.level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
              <Button onClick={handleEnroll} disabled={!enrollProgramId || enrolling}>
                {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enroll
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}