import mongoose, { Schema, models } from 'mongoose'

const FreezeSchema = new Schema({
  date: { type: String, required: true },   // "2026-03-25"
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "12:00"
  reason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export const Freeze = models.Freeze || mongoose.model('Freeze', FreezeSchema)