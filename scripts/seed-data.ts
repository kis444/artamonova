import { connectDB } from '@/lib/mongodb'
import { Course } from '@/models/Course'
import { Lesson } from '@/models/Lesson'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'

async function seedData() {
  try {
    await connectDB()
    console.log('📦 Connected to database')

    // Clear existing data
    await Course.deleteMany({})
    await Lesson.deleteMany({})
    console.log('🧹 Cleared existing courses and lessons')

    // Create courses
    const courses = await Course.insertMany([
      {
        nameEn: 'English Beginner A1',
        nameRo: 'Engleză Începători A1',
        nameRu: 'Английский для начинающих A1',
        level: 'A1',
        levelRange: { min: 0, max: 15 },
        descriptionEn: 'Start your English journey from zero',
        icon: 'seedling',
        order: 1
      },
      {
        nameEn: 'Elementary English A2',
        nameRo: 'Engleză Elementară A2',
        nameRu: 'Элементарный английский A2',
        level: 'A2',
        levelRange: { min: 15, max: 30 },
        descriptionEn: 'Build on your basics',
        icon: 'book',
        order: 2
      },
      {
        nameEn: 'Intermediate English B1',
        nameRo: 'Engleză Intermediară B1',
        nameRu: 'Средний английский B1',
        level: 'B1',
        levelRange: { min: 30, max: 50 },
        descriptionEn: 'Gain confidence in conversations',
        icon: 'target',
        order: 3
      },
      {
        nameEn: 'Upper Intermediate B2',
        nameRo: 'Engleză Avansată B2',
        nameRu: 'Продвинутый средний B2',
        level: 'B2',
        levelRange: { min: 50, max: 70 },
        descriptionEn: 'Master complex topics',
        icon: 'award',
        order: 4
      },
      {
        nameEn: 'Advanced English C1',
        nameRo: 'Engleză Avansată C1',
        nameRu: 'Продвинутый английский C1',
        level: 'C1',
        levelRange: { min: 70, max: 85 },
        descriptionEn: 'Achieve professional fluency',
        icon: 'briefcase',
        order: 5
      },
      {
        nameEn: 'Proficiency C2',
        nameRo: 'Engleză Profesională C2',
        nameRu: 'Профессиональный английский C2',
        level: 'C2',
        levelRange: { min: 85, max: 100 },
        descriptionEn: 'Master native-level English',
        icon: 'star',
        order: 6
      }
    ])

    console.log(`✅ Created ${courses.length} courses`)

    // Create lessons for each course
    for (const course of courses) {
      const lessons = []
      for (let i = 1; i <= 10; i++) {
        lessons.push({
          courseId: course._id,
          order: i,
          titleEn: `Lesson ${i}: ${getLessonTitle(course.level, i)}`,
          titleRo: `Lecția ${i}: ${getLessonTitleRo(course.level, i)}`,
          skills: getSkillsForLevel(course.level, i),
          materials: [
            {
              type: 'video',
              title: 'Introduction Video',
              url: 'https://youtube.com/watch?v=example'
            },
            {
              type: 'pdf',
              title: 'Lesson Materials',
              url: 'https://drive.google.com/example'
            }
          ],
          unlockDays: (i - 1) * 3, // Unlock every 3 days
          active: true
        })
      }
      await Lesson.insertMany(lessons)
      console.log(`✅ Created ${lessons.length} lessons for ${course.level}`)
    }

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@artamonova.com' })
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@artamonova.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active'
      })
      console.log('✅ Created admin user')
    }

    console.log('🎉 Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

function getLessonTitle(level: string, num: number): string {
  const topics: Record<string, string[]> = {
    A1: ['Greetings', 'Introductions', 'Numbers', 'Family', 'Food', 'Daily Routine', 'Weather', 'Clothes', 'House', 'Directions'],
    A2: ['Past Events', 'Future Plans', 'Shopping', 'Health', 'Hobbies', 'Travel', 'Work', 'Education', 'Culture', 'Technology'],
    B1: ['Opinions', 'Experiences', 'Goals', 'Relationships', 'Media', 'Society', 'Environment', 'Business', 'Art', 'Science'],
    B2: ['Debates', 'Negotiations', 'Presentations', 'Reports', 'Essays', 'Interviews', 'Discussions', 'Arguments', 'Reviews', 'Proposals'],
    C1: ['Analysis', 'Evaluation', 'Critique', 'Synthesis', 'Research', 'Publications', 'Lectures', 'Conferences', 'Papers', 'Theses'],
    C2: ['Nuance', 'Subtlety', 'Idioms', 'Culture', 'Philosophy', 'Literature', 'Poetry', 'Humor', 'Sarcasm', 'Sophistication']
  }
  return topics[level]?.[num - 1] || `Topic ${num}`
}

function getLessonTitleRo(level: string, num: number): string {
  const topics: Record<string, string[]> = {
    A1: ['Salutări', 'Prezentări', 'Numere', 'Familie', 'Mâncare', 'Rutina Zilnică', 'Vremea', 'Haine', 'Casa', 'Direcții'],
    A2: ['Evenimente Trecute', 'Planuri de Viitor', 'Cumpărături', 'Sănătate', 'Hobby-uri', 'Călătorii', 'Muncă', 'Educație', 'Cultură', 'Tehnologie'],
    B1: ['Opinii', 'Experiențe', 'Obiective', 'Relații', 'Mass-media', 'Societate', 'Mediu', 'Afaceri', 'Artă', 'Știință'],
    B2: ['Dezbateri', 'Negocieri', 'Prezentări', 'Rapoarte', 'Eseuri', 'Interviuri', 'Discuții', 'Argumente', 'Recenzii', 'Propuneri'],
    C1: ['Analiză', 'Evaluare', 'Critică', 'Sinteză', 'Cercetare', 'Publicații', 'Prelegeri', 'Conferințe', 'Lucrări', 'Teze'],
    C2: ['Nuanță', 'Subtilitate', 'Idiomuri', 'Cultură', 'Filozofie', 'Literatură', 'Poezie', 'Umor', 'Sarcasm', 'Sofisticare']
  }
  return topics[level]?.[num - 1] || `Subiectul ${num}`
}

function getSkillsForLevel(level: string, lessonNum: number): string[] {
  // Distribute skills across lessons
  const allSkills = ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading']
  const numSkills = lessonNum % 3 === 0 ? 3 : 2 // Some lessons have 3 skills, some 2
  const startIndex = (lessonNum - 1) % allSkills.length
  
  const skills = []
  for (let i = 0; i < numSkills; i++) {
    skills.push(allSkills[(startIndex + i) % allSkills.length])
  }
  return skills
}

// Run the seed
seedData()