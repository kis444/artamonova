// models/Homework.ts
import mongoose, { Schema, models } from 'mongoose'

const homeworkSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, default: '' },
  programId: { type: Schema.Types.ObjectId, ref: 'Program' }, // ADĂUGĂ ASTA
  title: { type: String, required: true },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  dueDate: { type: String },
  type: { type: String, enum: ['quiz', 'writing', 'file'], default: 'quiz' },
  lessonId: { type: Schema.Types.ObjectId, ref: 'LessonTemplate' },
  lessonNumber: { type: Number },
  lessonTitle: { type: String, default: '' },

  // Quiz questions (copied from template, includes media)
  questions: [{
    question: String,
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

  // Student answers
  answers: [{
    questionIndex: Number,
    answer: Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
  }],

  // Scores
  score: { type: Number },
  maxScore: { type: Number, default: 0 },

  // Writing/file submission
  submissionText: { type: String, default: '' },
  submissionFileUrl: { type: String, default: '' },
  submissionFileName: { type: String, default: '' },

  // Teacher feedback
  feedback: { type: String, default: '' },
  gradedAt: { type: Date },

  status: {
    type: String,
    enum: ['pending', 'submitted', 'auto_graded', 'graded'],
    default: 'pending',
  },

  createdAt: { type: Date, default: Date.now },
})

export const Homework = models.Homework || mongoose.model('Homework', homeworkSchema)