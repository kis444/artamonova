import mongoose, { Schema, models } from 'mongoose'

const lessonSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, required: true },
  titleEn: { type: String, required: true },
  titleRo: { type: String, default: '' },
  titleRu: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  descriptionRo: { type: String, default: '' },
  descriptionRu: { type: String, default: '' },
  // Skills tagged for this lesson
  skills: [{
    type: String,
    enum: ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading']
  }],
  // Materials
  materials: [{
    type: { type: String, enum: ['link', 'pdf', 'video', 'drive'] },
    title: String,
    url: String,
    description: String
  }],
  // Homework templates
  homeworkTemplates: [{
    type: { type: String, enum: ['quiz', 'writing'] },
    title: String,
    description: String,
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number // index for quiz, or 0 for writing
    }],
    maxScore: { type: Number, default: 10 }
  }],
  // Unlock date relative to enrollment (days after enrollment)
  unlockDays: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

export const Lesson = models.Lesson || mongoose.model('Lesson', lessonSchema)