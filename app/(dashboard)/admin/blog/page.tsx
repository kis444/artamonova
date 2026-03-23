'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Newspaper, ImageIcon, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Post = {
  _id: string; slug: string
  titleEn: string; titleRo: string; titleRu: string
  excerptEn: string; excerptRo: string; excerptRu: string
  contentEn: string; contentRo: string; contentRu: string
  coverImage: string; published: boolean; createdAt: string
}

const emptyForm = {
  titleEn: '', titleRo: '', titleRu: '',
  excerptEn: '', excerptRo: '', excerptRu: '',
  contentEn: '', contentRo: '', contentRu: '',
  coverImage: '', published: true,
}

export default function AdminBlogPage() {
  const { t } = useLocale()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setImagePreview('')
    setDialogOpen(true)
  }

  function openEdit(post: Post) {
    setEditingId(post._id)
    setForm({
      titleEn: post.titleEn, titleRo: post.titleRo, titleRu: post.titleRu,
      excerptEn: post.excerptEn, excerptRo: post.excerptRo, excerptRu: post.excerptRu,
      contentEn: post.contentEn, contentRo: post.contentRo, contentRu: post.contentRu,
      coverImage: post.coverImage, published: post.published,
    })
    setImagePreview(post.coverImage || '')
    setDialogOpen(true)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setForm((prev) => ({ ...prev, coverImage: result }))
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.titleEn) return
    setSaving(true)

    const url = editingId ? `/api/blog/${editingId}` : '/api/blog'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)

    if (res.ok) {
      if (editingId) {
        setPosts((prev) => prev.map((p) => p._id === editingId ? data : p))
      } else {
        setPosts((prev) => [data, ...prev])
      }
      setDialogOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return
    await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p._id !== id))
  }

  async function togglePublish(post: Post) {
    const res = await fetch(`/api/blog/${post._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p._id === post._id ? { ...p, published: !p.published } : p))
    }
  }

  const setField = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <>
      <DashboardHeader title={t.dashboard.admin.blog} />
      <main className="p-6">
        <div className="mb-6 flex justify-end">
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">{t.dashboard.admin.blog}</CardTitle>
            <CardDescription>{posts.length} article{posts.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /><span>Loading...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Newspaper className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No articles yet. Create your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post._id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                    {/* Cover thumbnail */}
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="font-medium truncate">{post.titleEn}</p>
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{post.excerptEn}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublish(post)}
                        title={post.published ? 'Unpublish' : 'Publish'}
                      >
                        {post.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingId ? 'Edit Article' : 'New Article'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Cover image */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div
                  className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary"
                  style={{ minHeight: '160px' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <p className="text-sm">Click to upload cover image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Published toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-sm text-muted-foreground">Visible on the public blog</p>
                </div>
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setField('published', v)}
                />
              </div>

              {/* Content in 3 languages */}
              <Tabs defaultValue="en">
                <TabsList className="w-full">
                  <TabsTrigger value="en" className="flex-1">🇬🇧 English</TabsTrigger>
                  <TabsTrigger value="ro" className="flex-1">🇷🇴 Română</TabsTrigger>
                  <TabsTrigger value="ru" className="flex-1">🇷🇺 Русский</TabsTrigger>
                </TabsList>

                {(['en', 'ro', 'ru'] as const).map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Title {lang === 'en' ? '(required)' : '(optional)'}</Label>
                      <Input
                        value={(form as any)[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || ''}
                        onChange={(e) => setField(`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`, e.target.value)}
                        placeholder={`Article title in ${lang === 'en' ? 'English' : lang === 'ro' ? 'Romanian' : 'Russian'}...`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Description</Label>
                      <Textarea
                        value={(form as any)[`excerpt${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || ''}
                        onChange={(e) => setField(`excerpt${lang.charAt(0).toUpperCase() + lang.slice(1)}`, e.target.value)}
                        placeholder="Short description shown in blog list..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Content</Label>
                      <Textarea
                        value={(form as any)[`content${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || ''}
                        onChange={(e) => setField(`content${lang.charAt(0).toUpperCase() + lang.slice(1)}`, e.target.value)}
                        placeholder="Write the full article content here..."
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.titleEn || saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Publish Article'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}