'use client'

import { useLocale } from '@/lib/locale-context'
import { useContent } from '@/lib/useContent'
import { CalendarDays, FileText, Video, TrendingUp } from 'lucide-react'

export function HowItWorks() {
  const { locale } = useLocale()
  const content = useContent()

  // Obține valorile din content cu fallback
  const title = content[`howItWorks.title.${locale}`] || 'How Lessons Work'
  const step1Title = content[`howItWorks.step1Title.${locale}`] || 'Book Your Slot'
  const step1Desc = content[`howItWorks.step1Desc.${locale}`] || 'Choose a convenient time from my available schedule'
  const step2Title = content[`howItWorks.step2Title.${locale}`] || 'Prepare Materials'
  const step2Desc = content[`howItWorks.step2Desc.${locale}`] || 'Receive lesson materials and objectives before class'
  const step3Title = content[`howItWorks.step3Title.${locale}`] || 'Join the Lesson'
  const step3Desc = content[`howItWorks.step3Desc.${locale}`] || 'Connect via Google Meet for your personalized session'
  const step4Title = content[`howItWorks.step4Title.${locale}`] || 'Practice & Progress'
  const step4Desc = content[`howItWorks.step4Desc.${locale}`] || 'Complete homework and track your improvement'

  const steps = [
    { icon: CalendarDays, title: step1Title, description: step1Desc },
    { icon: FileText, title: step2Title, description: step2Desc },
    { icon: Video, title: step3Title, description: step3Desc },
    { icon: TrendingUp, title: step4Title, description: step4Desc },
  ]

  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 left-1/2 z-20 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}