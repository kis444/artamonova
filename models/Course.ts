import mongoose, { Schema, models } from 'mongoose'

const courseSchema = new Schema({
  nameEn: { type: String, required: true },
  nameRo: { type: String, default: '' },
  nameRu: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  descriptionRo: { type: String, default: '' },
  descriptionRu: { type: String, default: '' },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true 
  },
  levelRange: {
    min: { type: Number, default: 0 }, // Procent minim pentru nivel
    max: { type: Number, default: 100 } // Procent maxim pentru nivel
  },
  icon: { type: String, default: 'book' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

export const Course = models.Course || mongoose.model('Course', courseSchema)