import mongoose, { Schema, models } from 'mongoose'

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['homework_feedback', 'lesson_unlocked', 'homework_reminder', 'lesson_reminder', 'general'],
    default: 'general',
  },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

notificationSchema.index({ userId: 1, createdAt: -1 })

export const Notification = models.Notification || mongoose.model('Notification', notificationSchema)