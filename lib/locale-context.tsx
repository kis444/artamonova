'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type Locale, defaultLocale, translations } from './i18n'

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof translations.en
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }, [])

const t = translations[locale] as typeof translations.en

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}