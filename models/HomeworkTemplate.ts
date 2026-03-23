// models/HomeworkTemplate.ts - adaugă programId
import mongoose, { Schema, models } from 'mongoose'

const homeworkTemplateSchema = new Schema({
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true }, // NOU
  lessonId: { type: Schema.Types.ObjectId, ref: 'LessonTemplate', required: true },
  type: { type: String, enum: ['quiz', 'writing', 'file'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple_choice', 'text'], default: 'multiple_choice' },
    options: [String],
    correctAnswer: Schema.Types.Mixed,
    points: { type: Number, default: 1 },
    media: {
      type: { type: String, enum: ['youtube', 'audio', 'pdf', 'link'] },
      url: String,
      label: String,
    },
  }],
  prompt: { type: String, default: '' },
  wordLimit: { type: Number, default: 0 },
  dueDaysAfterUnlock: { type: Number, default: 7 },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export const HomeworkTemplate = models.HomeworkTemplate || mongoose.model('HomeworkTemplate', homeworkTemplateSchema)