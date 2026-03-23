import mongoose, { Schema, models } from 'mongoose'

const enrollmentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  currentLessonNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

enrollmentSchema.index({ studentId: 1, programId: 1 }, { unique: true })

export const Enrollment = models.Enrollment || mongoose.model('Enrollment', enrollmentSchema)
