import mongoose, { Schema, models } from 'mongoose'

const lessonTemplateSchema = new Schema({
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  lessonNumber: { type: Number, required: true },
  titleEn: { type: String, required: true },
  titleRo: { type: String, default: '' },
  titleRu: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  descriptionRo: { type: String, default: '' },
  descriptionRu: { type: String, default: '' },
  
  skills: [{
    type: String,
    enum: ['grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'reading']
  }],
  
  duration: { type: Number, default: 60 },
  
  materials: [{
    type: { type: String, enum: ['pdf', 'link', 'video', 'drive'] },
    title: String,
    url: String,
    description: String
  }],
  
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

lessonTemplateSchema.index({ programId: 1, lessonNumber: 1 }, { unique: true })

export const LessonTemplate = models.LessonTemplate || mongoose.model('LessonTemplate', lessonTemplateSchema)
