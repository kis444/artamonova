import mongoose, { Schema, models } from 'mongoose'

const reviewSchema = new Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  textRo: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, required: true },
  program: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

export const Review = models.Review || mongoose.model('Review', reviewSchema)