'use client'

import { Hero } from '@/components/sections/hero'
import { TeacherIntro } from '@/components/sections/teacher-intro'
import { ProgramsPreview } from '@/components/sections/programs-preview'
import { Reviews } from '@/components/sections/reviews'
import { HowItWorks } from '@/components/sections/how-it-works'
import { BlogPreview } from '@/components/sections/blog-preview'
import { ContactPreview } from '@/components/sections/contact-preview'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TeacherIntro />
      <ProgramsPreview />
      <HowItWorks />
      <Reviews />
      <BlogPreview />
      <ContactPreview />
    </>
  )
}
