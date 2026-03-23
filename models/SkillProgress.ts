import mongoose, { Schema, models } from 'mongoose'

const skillProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: false },
  
  grammar: { type: Number, default: 0, min: 0, max: 100 },
  vocabulary: { type: Number, default: 0, min: 0, max: 100 },
  speaking: { type: Number, default: 0, min: 0, max: 100 },
  writing: { type: Number, default: 0, min: 0, max: 100 },
  listening: { type: Number, default: 0, min: 0, max: 100 },
  reading: { type: Number, default: 0, min: 0, max: 100 },
  
  // History of progress changes
  history: [{
    skill: String,
    oldValue: Number,
    newValue: Number,
    source: { type: String, enum: ['homework', 'lesson_evaluation'] },
    sourceId: Schema.Types.ObjectId,
    date: { type: Date, default: Date.now }
  }],
  
  lastUpdated: { type: Date, default: Date.now }
})

skillProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true })

export const SkillProgress = models.SkillProgress || mongoose.model('SkillProgress', skillProgressSchema)