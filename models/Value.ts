import mongoose, { Schema, models } from 'mongoose'

const valueSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  titleRo: { type: String, default: '' },
  descriptionRo: { type: String, default: '' },
  icon: { type: String, default: 'Heart' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

export const Value = models.Value || mongoose.model('Value', valueSchema)