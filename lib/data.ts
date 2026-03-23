import type { Program, Certification, BlogPost, Review, PlacementQuestion, Student, Lesson, Homework } from './types'

// PĂSTRĂM DOAR mock-urile pentru câmpurile care nu sunt încă în DB
// Programele și certificările vin din MongoDB, deci le ștergem de aici

export const certifications: Certification[] = [] // Gol, vine din DB

export const reviews: Review[] = [
  {
    id: '1',
    name: 'Maria Ionescu',
    text: 'Alexandra helped me pass my CAE exam with flying colors! Her teaching method is patient and effective.',
    textRo: 'Alexandra m-a ajutat să trec examenul CAE cu brio! Metoda ei de predare este răbdătoare și eficientă.',
    rating: 5,
    program: 'Cambridge Exam Preparation',
  },
  {
    id: '2',
    name: 'Alexandru Popa',
    text: 'The Business English course transformed my professional communication. I now lead meetings in English with confidence.',
    textRo: 'Cursul de Engleză de Afaceri mi-a transformat comunicarea profesională. Acum conduc întâlniri în engleză cu încredere.',
    rating: 5,
    program: 'Business English',
  },
  {
    id: '3',
    name: 'Diana Rusu',
    text: 'Started from absolute zero and now I can hold conversations! Alexandra makes learning fun and stress-free.',
    textRo: 'Am început de la zero absolut și acum pot purta conversații! Alexandra face învățarea distractivă și fără stres.',
    rating: 5,
    program: 'English from Zero',
  },
  {
    id: '4',
    name: 'Andrei Mihai',
    text: 'Excellent IELTS preparation. I achieved band 7.5 thanks to Alexandra\'s structured approach and practice materials.',
    textRo: 'Pregătire excelentă pentru IELTS. Am obținut banda 7.5 datorită abordării structurate și materialelor de practică ale Elenei.',
    rating: 5,
    program: 'IELTS Preparation',
  },
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Tips for Improving Your English Speaking Skills',
    titleRo: '10 Sfaturi pentru a-ți Îmbunătăți Abilitățile de Vorbire în Engleză',
    excerpt: 'Discover practical strategies to boost your spoken English and gain confidence in conversations.',
    excerptRo: 'Descoperă strategii practice pentru a-ți îmbunătăți engleza vorbită și a câștiga încredere în conversații.',
    content: '',
    contentRo: '',
    date: '2026-03-01',
    slug: 'tips-for-speaking',
  },
  {
    id: '2',
    title: 'Common Grammar Mistakes and How to Avoid Them',
    titleRo: 'Greșeli Gramaticale Comune și Cum să le Eviți',
    excerpt: 'Learn about the most frequent grammar errors English learners make and get tips to fix them.',
    excerptRo: 'Află despre cele mai frecvente erori gramaticale pe care le fac cei care învață engleză și obține sfaturi pentru a le corecta.',
    content: '',
    contentRo: '',
    date: '2026-02-15',
    slug: 'grammar-mistakes',
  },
  {
    id: '3',
    title: 'How to Prepare for Cambridge Exams',
    titleRo: 'Cum să te Pregătești pentru Examenele Cambridge',
    excerpt: 'A comprehensive guide to preparing for FCE, CAE, and CPE exams with study plans and resources.',
    excerptRo: 'Un ghid cuprinzător pentru pregătirea examenelor FCE, CAE și CPE cu planuri de studiu și resurse.',
    content: '',
    contentRo: '',
    date: '2026-02-01',
    slug: 'cambridge-prep',
  },
]

export const placementQuestions: PlacementQuestion[] = [
  {
    id: 1,
    question: 'She ___ to the cinema yesterday.',
    options: ['go', 'goes', 'went', 'going'],
    correctAnswer: 2,
    level: 'A2',
  },
  // ... restul întrebărilor (păstrează-le)
]

// Mock data pentru dashboards - temporar, până avem în DB
export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Maria Ionescu',
    email: 'maria@example.com',
    level: 'B2',
    program: 'Cambridge Exam Preparation',
    lessonsCompleted: 24,
    joinDate: '2025-09-01',
  },
  {
    id: '2',
    name: 'Alexandru Popa',
    email: 'alex@example.com',
    level: 'B1',
    program: 'Business English',
    lessonsCompleted: 18,
    joinDate: '2025-10-15',
  },
  {
    id: '3',
    name: 'Diana Rusu',
    email: 'diana@example.com',
    level: 'A2',
    program: 'General English',
    lessonsCompleted: 12,
    joinDate: '2025-11-01',
  },
]

export const generateTimeSlots = (date: Date): { time: string; available: boolean }[] => {
  const slots = []
  const bookedTimes = ['10:00', '14:00'] // Mock booked times
  
  for (let hour = 9; hour <= 18; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    slots.push({
      time,
      available: !bookedTimes.includes(time),
    })
  }
  
  return slots
}