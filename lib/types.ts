export interface Program {
  id: string
  name: string
  nameRo: string
  description: string
  descriptionRo: string
  level: string
  duration: string
  price: number
  icon: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: string
  pdfUrl?: string
  externalUrl?: string
}

export interface BlogPost {
  id: string
  title: string
  titleRo: string
  excerpt: string
  excerptRo: string
  content: string
  contentRo: string
  date: string
  slug: string
  coverImage?: string
}

export interface Review {
  id: string
  name: string
  text: string
  textRo: string
  rating: number
  program: string
  avatar?: string
}

export interface TimeSlot {
  id: string
  date: string
  time: string
  available: boolean
}

export interface Lesson {
  id: string
  studentId: string
  studentName: string
  date: string
  time: string
  program: string
  status: 'scheduled' | 'completed' | 'cancelled'
  meetLink?: string
  notes?: string
}

export interface Student {
  id: string
  name: string
  email: string
  level: string
  program: string
  lessonsCompleted: number
  joinDate: string
  avatar?: string
}

export interface Homework {
  id: string
  studentId: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'reviewed'
  grade?: string
  feedback?: string
}

export interface PlacementQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}
