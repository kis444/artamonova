// scripts/migrate-existing-homework.ts
import { connectDB } from '../lib/mongodb'
import { Homework } from '../models/Homework'
import { Lesson } from '../models/Lesson'

async function migrateHomework() {
  await connectDB()
  
  console.log('Starting migration...')
  
  // Găsește toate homework-urile existente
  const homeworks = await Homework.find({})
  console.log(`Found ${homeworks.length} homework submissions`)
  
  let updated = 0
  let skipped = 0
  
  for (const hw of homeworks) {
    // Dacă are deja programId, skip
    if (hw.programId) {
      skipped++
      continue
    }
    
    // Găsește lesson-ul pentru a obține programId
    if (hw.lessonId) {
      const lesson = await Lesson.findById(hw.lessonId)
      if (lesson) {
        hw.programId = lesson.programId
        hw.templateId = lesson.homeworkTemplateId // dacă există
        await hw.save()
        updated++
        console.log(`Updated homework ${hw._id} with programId ${lesson.programId}`)
      }
    }
  }
  
  console.log(`Migration complete: ${updated} updated, ${skipped} skipped`)
  process.exit()
}

migrateHomework().catch(console.error)