import mongoose, { Schema, models } from 'mongoose'

const programSchema = new Schema({
  nameEn: { type: String, required: true },
  nameRo: { type: String, default: '' },
  nameRu: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  descriptionRo: { type: String, default: '' },
  descriptionRu: { type: String, default: '' },
  level: { type: String, required: true },
  duration: { type: String, default: '60 min' },
  price: { type: Number, required: true },
  icon: { type: String, default: 'book' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

// Verifică dacă modelul există deja
export const Program = models.Program || mongoose.model('Program', programSchema)
