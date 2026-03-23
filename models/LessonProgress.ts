import mongoose, { Schema, models } from 'mongoose'

const lessonProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true }, // ← schimbă din courseId în programId
  lessonNumber: { type: Number, required: true }, // 1, 2, 3...
  
  // When the student booked this lesson
  scheduledDate: { type: Date }, // data programării
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date },
  
  // Completion status
  status: { 
    type: String, 
    enum: ['locked', 'available', 'started', 'completed', 'evaluated'],
    default: 'locked'
  },
  completedAt: { type: Date },
  
  // Teacher evaluation after lesson
  teacherScore: { type: Number, min: 1, max: 10 },
  teacherFeedback: { type: String, default: '' },
  teacherEvaluatedAt: { type: Date },
  
  // Skills improved by this lesson
  skillsImproved: [{
    skill: { type: String, enum: ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading'] },
    score: Number
  }],
  
  createdAt: { type: Date, default: Date.now }
})

lessonProgressSchema.index({ studentId: 1, programId: 1, lessonNumber: 1 }, { unique: true })

export const LessonProgress = models.LessonProgress || mongoose.model('LessonProgress', lessonProgressSchema)