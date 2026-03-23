'use client'

import { useState, useEffect, createContext, useContext } from 'react'

type ContentMap = Record<string, string>

const ContentContext = createContext<ContentMap>({})

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentMap>({})

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err))
  }, [])

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  return useContext(ContentContext)
}

export function useContentValue(key: string, fallback: string = ''): string {
  const content = useContent()
  return content[key] ?? fallback
}