import mongoose, { Schema, models } from 'mongoose'

const contentSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
})

export const Content = models.Content || mongoose.model('Content', contentSchema)