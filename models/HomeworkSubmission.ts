import mongoose, { Schema, models } from 'mongoose'

const homeworkSubmissionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'HomeworkTemplate', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'LessonTemplate', required: true },
  
  // For quiz - auto-correct
  answers: [{
    questionIndex: Number,
    answer: Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  quizScore: { type: Number, default: 0 },
  
  // For writing / file
  textSubmission: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  
  // Teacher grading
  teacherScore: { type: Number, min: 1, max: 10 },
  teacherFeedback: { type: String, default: '' },
  
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'auto_graded', 'teacher_graded'],
    default: 'pending'
  },
  submittedAt: { type: Date },
  gradedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
})

export const HomeworkSubmission = models.HomeworkSubmission || mongoose.model('HomeworkSubmission', homeworkSubmissionSchema)