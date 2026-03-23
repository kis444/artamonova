import mongoose, { Schema, models } from 'mongoose'

const timelineSchema = new Schema({
  year: { type: String, required: true },
  eventEn: { type: String, required: true },
  eventRo: { type: String, default: '' },
  eventRu: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

export const Timeline = models.Timeline || mongoose.model('Timeline', timelineSchema)