import mongoose, { Schema, models } from 'mongoose'

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'student', 'teacher'], default: 'student' },
  phone: { type: String, default: '' },
  level: { type: String, default: '' },
  program: { type: String, default: '' },
  permanentMeetLink: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
})

export const User = models.User || mongoose.model('User', userSchema)