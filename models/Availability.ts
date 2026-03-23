import mongoose, { Schema, models } from 'mongoose'

// Default working hours saved by admin
const AvailabilitySchema = new Schema({
  dayOfWeek: { type: Number, required: true }, // 0=Sun, 1=Mon...6=Sat
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '18:00' },
  isActive: { type: Boolean, default: true },
})

export const Availability = models.Availability || mongoose.model('Availability', AvailabilitySchema)