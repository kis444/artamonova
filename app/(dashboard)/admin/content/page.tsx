'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, Plus, Trash2, Edit, BookOpen, User, Award, Clock, FileText, Mail, Phone, MapPin, Globe, Send, Link as LinkIcon } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type TimelineItem = {
  _id?: string
  year: string
  eventEn: string
  eventRo: string
  eventRu: string
  order: number
}

type Certification = {
  _id?: string
  titleEn: string
  titleRo: string
  titleRu: string
  issuer: string
  year: string
  pdfUrl?: string
  imageUrl?: string
  order: number
}

type PlacementQuestion = {
  _id?: string
  textEn: string
  textRo: string
  textRu: string
  options?: string[]
  correctAnswer: number
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  order: number
}

const langs = ['en', 'ro', 'ru'] as const
type Lang = typeof langs[number]
const langLabels: Record<Lang, string> = { en: '🇬🇧 English', ro: '🇷🇴 Română', ru: '🇷🇺 Русский' }

type HomeSubSection = 'hero' | 'teacherIntro' | 'contact'
type AboutSubSection = 'about' | 'philosophy' | 'certifications' | 'timeline'

export default function AdminContentPage() {
  const [activeMainTab, setActiveMainTab] = useState<'home' | 'about' | 'placement'>('home')
  const [activeHomeSub, setActiveHomeSub] = useState<HomeSubSection>('hero')
  const [activeAboutSub, setActiveAboutSub] = useState<AboutSubSection>('about')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  
  // Content data
  const [content, setContent] = useState<Record<string, string>>({})
  
  // Timeline
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false)
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null)
  const [timelineForm, setTimelineForm] = useState({ year: '', eventEn: '', eventRo: '', eventRu: '' })
  
  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<Certification | null>(null)
  const [certForm, setCertForm] = useState({ titleEn: '', titleRo: '', titleRu: '', issuer: '', year: '', pdfUrl: '', imageUrl: '' })
  
  // Placement Test
  const [questions, setQuestions] = useState<PlacementQuestion[]>([])
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<PlacementQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState({
    textEn: '',
    textRo: '',
    textRu: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    level: 'A1' as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/content').then(r => r.json()),
      fetch('/api/timeline').then(r => r.json()),
      fetch('/api/certifications').then(r => r.json()),
      fetch('/api/placement-test/questions').then(r => r.json()),
    ]).then(([c, t, certs, qs]) => {
      setContent(c || {})
      setTimeline(Array.isArray(t) ? t : [])
      setCertifications(Array.isArray(certs) ? certs : [])
      setQuestions(Array.isArray(qs) ? qs : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getValue = (key: string, lang: Lang): string => {
    const value = content[`${key}.${lang}`]
    return value !== undefined && value !== null ? value : ''
  }

  const setValue = (key: string, lang: Lang, val: string) => {
    setContent(prev => ({ ...prev, [`${key}.${lang}`]: val ?? '' }))
  }

  const handleSave = async (key: string, lang: Lang) => {
    const fullKey = `${key}.${lang}`
    setSaving(fullKey)
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: fullKey, value: content[fullKey] ?? '' }),
    })
    setSaving(null)
    setSaved(fullKey)
    setTimeout(() => setSaved(null), 2000)
  }

  // Timeline functions
  const handleSaveTimeline = async () => {
    if (!timelineForm.year || !timelineForm.eventEn) {
      alert('Please enter year and event in English')
      return
    }
    
    const url = editingTimeline?._id ? `/api/timeline/${editingTimeline._id}` : '/api/timeline'
    const method = editingTimeline?._id ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        year: timelineForm.year,
        eventEn: timelineForm.eventEn,
        eventRo: timelineForm.eventRo || '',
        eventRu: timelineForm.eventRu || '',
        order: timeline.length 
      }),
    })
    
    if (res.ok) {
      const data = await res.json()
      if (editingTimeline?._id) {
        setTimeline(prev => prev.map(t => t._id === editingTimeline._id ? data : t))
      } else {
        setTimeline(prev => [...prev, data])
      }
      setTimelineDialogOpen(false)
      setTimelineForm({ year: '', eventEn: '', eventRo: '', eventRu: '' })
      setEditingTimeline(null)
    }
  }

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Delete this timeline item?')) return
    await fetch(`/api/timeline/${id}`, { method: 'DELETE' })
    setTimeline(prev => prev.filter(t => t._id !== id))
  }

  // Certifications functions
const handleSaveCert = async () => {
  if (!certForm.titleEn || !certForm.issuer) {
    alert('Please enter title and issuer')
    return
  }
  
  const url = editingCert?._id ? `/api/certifications/${editingCert._id}` : '/api/certifications'
  const method = editingCert?._id ? 'PUT' : 'POST'
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleEn: certForm.titleEn,
        titleRo: certForm.titleRo || '',
        titleRu: certForm.titleRu || '',
        issuer: certForm.issuer,
        year: certForm.year || '',
        pdfUrl: certForm.pdfUrl || '',
        imageUrl: certForm.imageUrl || '',
      }),
    })
    
    if (!res.ok) {
      const text = await res.text()
      console.error('Response not OK:', res.status, text)
      alert(`Error ${res.status}: ${text}`)
      return
    }
    
    const data = await res.json()
    console.log('Success:', data)
    
    if (editingCert?._id) {
      setCertifications(prev => prev.map(c => c._id === editingCert._id ? data : c))
    } else {
      setCertifications(prev => [...prev, data])
    }
    setCertDialogOpen(false)
    setCertForm({ titleEn: '', titleRo: '', titleRu: '', issuer: '', year: '', pdfUrl: '', imageUrl: '' })
    setEditingCert(null)
    
  } catch (err) {
    const error = err as Error
    console.error('Fetch error:', error)
    alert('Network error: ' + error.message)
  }
}

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    await fetch(`/api/certifications/${id}`, { method: 'DELETE' })
    setCertifications(prev => prev.filter(c => c._id !== id))
  }

  // Placement test functions
  const handleSaveQuestion = async () => {
    if (!questionForm.textEn) {
      alert('Please enter question text in English')
      return
    }
    
    const url = editingQuestion?._id ? `/api/placement-test/questions/${editingQuestion._id}` : '/api/placement-test/questions'
    const method = editingQuestion?._id ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textEn: questionForm.textEn,
        textRo: questionForm.textRo,
        textRu: questionForm.textRu,
        options: questionForm.options.filter(opt => opt.trim() !== ''),
        correctAnswer: questionForm.correctAnswer,
        level: questionForm.level,
      }),
    })
    
    if (res.ok) {
      const data = await res.json()
      if (editingQuestion?._id) {
        setQuestions(prev => prev.map(q => q._id === editingQuestion._id ? data : q))
      } else {
        setQuestions(prev => [...prev, data])
      }
      setQuestionDialogOpen(false)
      setQuestionForm({ 
        textEn: '', 
        textRo: '', 
        textRu: '', 
        options: ['', '', '', ''], 
        correctAnswer: 0, 
        level: 'A1' 
      })
      setEditingQuestion(null)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return
    await fetch(`/api/placement-test/questions/${id}`, { method: 'DELETE' })
    setQuestions(prev => prev.filter(q => q._id !== id))
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="Content Management" />
        <main className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Content Management" />
      <main className="p-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Manage all site content in one place: Hero, Teacher Info, Contact, About, Certifications, and Placement Test.
        </p>

        <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as any)} className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="home" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Home</TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2"><User className="h-4 w-4" /> About</TabsTrigger>
            <TabsTrigger value="placement" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Placement Test</TabsTrigger>
          </TabsList>

          {/* HOME TAB */}
          <TabsContent value="home">
            <div className="flex gap-6">
              <div className="w-56 shrink-0">
                <div className="space-y-1">
                  <button onClick={() => setActiveHomeSub('hero')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2', activeHomeSub === 'hero' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><BookOpen className="h-4 w-4" /><span>Hero</span></button>
                  <button onClick={() => setActiveHomeSub('teacherIntro')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2', activeHomeSub === 'teacherIntro' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><User className="h-4 w-4" /><span>Teacher Intro</span></button>
                  <button onClick={() => setActiveHomeSub('contact')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2', activeHomeSub === 'contact' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><Mail className="h-4 w-4" /><span>Contact Info</span></button>
                </div>
              </div>
              <div className="flex-1">
                {activeHomeSub === 'hero' && (
                  <div className="space-y-6">{langs.map(lang => (<Card key={lang}><CardHeader><CardTitle>Hero - {langLabels[lang]}</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Hero Title</Label><Input value={getValue('hero.title', lang) || ''} onChange={e => setValue('hero.title', lang, e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('hero.title', lang)}>Save</Button></div><div className="space-y-2 mt-4"><Label>Hero Subtitle</Label><Textarea value={getValue('hero.subtitle', lang) || ''} onChange={e => setValue('hero.subtitle', lang, e.target.value)} rows={2} /><Button size="sm" variant="outline" onClick={() => handleSave('hero.subtitle', lang)}>Save</Button></div></CardContent></Card>))}</div>
                )}
                {activeHomeSub === 'teacherIntro' && (
                  <div className="space-y-6">{langs.map(lang => (<Card key={lang}><CardHeader><CardTitle>Teacher Intro - {langLabels[lang]}</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Title</Label><Input value={getValue('teacherIntro.title', lang) || ''} onChange={e => setValue('teacherIntro.title', lang, e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('teacherIntro.title', lang)}>Save</Button></div><div className="space-y-2 mt-4"><Label>Bio</Label><Textarea value={getValue('teacherIntro.bio', lang) || ''} onChange={e => setValue('teacherIntro.bio', lang, e.target.value)} rows={4} /><Button size="sm" variant="outline" onClick={() => handleSave('teacherIntro.bio', lang)}>Save</Button></div><div className="space-y-2 mt-4"><Label>Teaching Philosophy</Label><Textarea value={getValue('philosophy.text', lang) || ''} onChange={e => setValue('philosophy.text', lang, e.target.value)} rows={4} /><Button size="sm" variant="outline" onClick={() => handleSave('philosophy.text', lang)}>Save</Button></div></CardContent></Card>))}</div>
                )}
                {activeHomeSub === 'contact' && (
                  <Card><CardHeader><CardTitle>Contact Information</CardTitle><CardDescription>These appear on homepage, contact page, and footer</CardDescription></CardHeader><CardContent className="space-y-4">
                    <div className="space-y-2"><Label><Mail className="h-4 w-4 inline mr-2" />Email</Label><Input value={getValue('contact.email', 'en') || ''} onChange={e => setValue('contact.email', 'en', e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('contact.email', 'en')}>Save</Button></div>
                    <div className="space-y-2"><Label><Phone className="h-4 w-4 inline mr-2" />Phone</Label><Input value={getValue('contact.phone', 'en') || ''} onChange={e => setValue('contact.phone', 'en', e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('contact.phone', 'en')}>Save</Button></div>
                    <div className="space-y-2"><Label><MapPin className="h-4 w-4 inline mr-2" />Location (use \n for new line)</Label><Textarea value={getValue('contact.address', 'en') || ''} onChange={e => setValue('contact.address', 'en', e.target.value)} rows={3} /><Button size="sm" variant="outline" onClick={() => handleSave('contact.address', 'en')}>Save</Button></div>
                    <div className="space-y-2"><Label><Globe className="h-4 w-4 inline mr-2" />Facebook URL</Label><Input value={getValue('contact.facebook', 'en') || ''} onChange={e => setValue('contact.facebook', 'en', e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('contact.facebook', 'en')}>Save</Button></div>
                    <div className="space-y-2"><Label><Globe className="h-4 w-4 inline mr-2" />Instagram URL</Label><Input value={getValue('contact.instagram', 'en') || ''} onChange={e => setValue('contact.instagram', 'en', e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('contact.instagram', 'en')}>Save</Button></div>
                    <div className="space-y-2"><Label><Send className="h-4 w-4 inline mr-2" />Telegram URL</Label><Input value={getValue('contact.telegram', 'en') || ''} onChange={e => setValue('contact.telegram', 'en', e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('contact.telegram', 'en')}>Save</Button></div>
                  </CardContent></Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about">
            <div className="flex gap-6">
              <div className="w-56 shrink-0">
                <div className="space-y-1">
                  <button onClick={() => setActiveAboutSub('about')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors', activeAboutSub === 'about' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><User className="h-4 w-4 inline mr-2" />About Bio</button>
                  <button onClick={() => setActiveAboutSub('philosophy')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors', activeAboutSub === 'philosophy' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><BookOpen className="h-4 w-4 inline mr-2" />Teaching Philosophy</button>
                  <button onClick={() => setActiveAboutSub('certifications')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors', activeAboutSub === 'certifications' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><Award className="h-4 w-4 inline mr-2" />Certifications</button>
                  <button onClick={() => setActiveAboutSub('timeline')} className={cn('w-full text-left px-3 py-2 rounded-md transition-colors', activeAboutSub === 'timeline' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><Clock className="h-4 w-4 inline mr-2" />Experience Timeline</button>
                </div>
              </div>
              <div className="flex-1">
                {activeAboutSub === 'about' && (
                  <div className="space-y-6">{langs.map(lang => (<Card key={lang}><CardHeader><CardTitle>About - {langLabels[lang]}</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Title</Label><Input value={getValue('about.title', lang) || ''} onChange={e => setValue('about.title', lang, e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('about.title', lang)}>Save</Button></div><div className="space-y-2 mt-4"><Label>Bio</Label><Textarea value={getValue('about.bio', lang) || ''} onChange={e => setValue('about.bio', lang, e.target.value)} rows={6} /><Button size="sm" variant="outline" onClick={() => handleSave('about.bio', lang)}>Save</Button></div></CardContent></Card>))}</div>
                )}
                {activeAboutSub === 'philosophy' && (
                  <div className="space-y-6">{langs.map(lang => (<Card key={lang}><CardHeader><CardTitle>Philosophy - {langLabels[lang]}</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Title</Label><Input value={getValue('philosophy.title', lang) || ''} onChange={e => setValue('philosophy.title', lang, e.target.value)} /><Button size="sm" variant="outline" onClick={() => handleSave('philosophy.title', lang)}>Save</Button></div><div className="space-y-2 mt-4"><Label>Text</Label><Textarea value={getValue('philosophy.text', lang) || ''} onChange={e => setValue('philosophy.text', lang, e.target.value)} rows={6} /><Button size="sm" variant="outline" onClick={() => handleSave('philosophy.text', lang)}>Save</Button></div></CardContent></Card>))}</div>
                )}
                {activeAboutSub === 'certifications' && (
                  <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Certifications</CardTitle><Button size="sm" onClick={() => { setEditingCert(null); setCertForm({ titleEn: '', titleRo: '', titleRu: '', issuer: '', year: '', pdfUrl: '', imageUrl: '' }); setCertDialogOpen(true) }}><Plus className="h-4 w-4" /> Add</Button></CardHeader><CardContent>
                    {certifications.map(cert => (<div key={cert._id} className="flex justify-between items-center border-b py-3"><div><p className="font-medium">{cert.titleEn}</p><p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>{cert.pdfUrl && <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"><LinkIcon className="h-3 w-3" />View Certificate</a>}</div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => { setEditingCert(cert); setCertForm({ titleEn: cert.titleEn, titleRo: cert.titleRo || '', titleRu: cert.titleRu || '', issuer: cert.issuer, year: cert.year, pdfUrl: cert.pdfUrl || '', imageUrl: cert.imageUrl || '' }); setCertDialogOpen(true) }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCert(cert._id!)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div></div>))}
                  </CardContent></Card>
                )}
                {activeAboutSub === 'timeline' && (
                  <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Timeline</CardTitle><Button size="sm" onClick={() => { setEditingTimeline(null); setTimelineForm({ year: '', eventEn: '', eventRo: '', eventRu: '' }); setTimelineDialogOpen(true) }}><Plus className="h-4 w-4" /> Add</Button></CardHeader><CardContent>
                    {timeline.map(item => (<div key={item._id} className="flex justify-between items-center border-b py-2"><div><p className="font-semibold text-primary">{item.year}</p><p>{item.eventEn}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => { setEditingTimeline(item); setTimelineForm({ year: item.year, eventEn: item.eventEn, eventRo: item.eventRo || '', eventRu: item.eventRu || '' }); setTimelineDialogOpen(true) }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteTimeline(item._id!)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div></div>))}
                  </CardContent></Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* PLACEMENT TEST TAB */}
          <TabsContent value="placement">
            <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Placement Test Questions</CardTitle><Button size="sm" onClick={() => { setEditingQuestion(null); setQuestionForm({ textEn: '', textRo: '', textRu: '', options: ['', '', '', ''], correctAnswer: 0, level: 'A1' }); setQuestionDialogOpen(true) }}><Plus className="h-4 w-4" /> Add</Button></CardHeader><CardContent>
              {questions.map((q, idx) => (<div key={q._id} className="border-b py-3"><div className="flex items-center gap-2"><span className="text-xs bg-muted px-2 py-0.5 rounded">{q.level}</span><span className="text-xs text-muted-foreground">Q{idx + 1}</span></div><p className="font-medium mt-1">{q.textEn}</p><div className="flex justify-end gap-1 mt-2"><Button variant="ghost" size="icon" onClick={() => { setEditingQuestion(q); setQuestionForm({ textEn: q.textEn, textRo: q.textRo || '', textRu: q.textRu || '', options: q.options || ['', '', '', ''], correctAnswer: q.correctAnswer, level: q.level }); setQuestionDialogOpen(true) }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q._id!)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div></div>))}
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* Timeline Dialog */}
        <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingTimeline ? 'Edit' : 'Add'} Timeline Event</DialogTitle></DialogHeader><div className="space-y-4"><Input value={timelineForm.year || ''} onChange={e => setTimelineForm({ ...timelineForm, year: e.target.value })} placeholder="Year" /><Textarea value={timelineForm.eventEn || ''} onChange={e => setTimelineForm({ ...timelineForm, eventEn: e.target.value })} placeholder="Event (English)" rows={3} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setTimelineDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveTimeline}>Save</Button></div></div></DialogContent></Dialog>

        {/* Certifications Dialog */}
        <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingCert ? 'Edit' : 'Add'} Certification</DialogTitle></DialogHeader><div className="space-y-4"><Input value={certForm.titleEn || ''} onChange={e => setCertForm({ ...certForm, titleEn: e.target.value })} placeholder="Title (English) *" /><Input value={certForm.issuer || ''} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} placeholder="Issuer *" /><Input value={certForm.year || ''} onChange={e => setCertForm({ ...certForm, year: e.target.value })} placeholder="Year" /><div className="space-y-2"><Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> PDF URL (optional)</Label><Input value={certForm.pdfUrl || ''} onChange={e => setCertForm({ ...certForm, pdfUrl: e.target.value })} placeholder="https://example.com/certificate.pdf" /><p className="text-xs text-muted-foreground">Link to PDF certificate (will be shown on About page)</p></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCertDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveCert}>Save</Button></div></div></DialogContent></Dialog>

        {/* Placement Test Dialog */}
        <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingQuestion ? 'Edit' : 'Add'} Question</DialogTitle></DialogHeader><div className="space-y-4"><select className="w-full border rounded p-2" value={questionForm.level} onChange={e => setQuestionForm({ ...questionForm, level: e.target.value as any })}><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option><option value="C1">C1</option><option value="C2">C2</option></select><Textarea value={questionForm.textEn || ''} onChange={e => setQuestionForm({ ...questionForm, textEn: e.target.value })} placeholder="Question (English)" rows={2} /><div className="space-y-2">{questionForm.options.map((opt, idx) => (<Input key={idx} value={opt || ''} onChange={e => { const newOpts = [...questionForm.options]; newOpts[idx] = e.target.value; setQuestionForm({ ...questionForm, options: newOpts }); }} placeholder={`Option ${String.fromCharCode(65 + idx)}`} />))}</div><Input type="number" value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })} placeholder="Correct answer index (0-based)" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveQuestion}>Save</Button></div></div></DialogContent></Dialog>
      </main>
    </>
  )
}
