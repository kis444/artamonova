import mongoose, { Schema, models } from 'mongoose'

const placementQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

export const PlacementQuestion = models.PlacementQuestion || mongoose.model('PlacementQuestion', placementQuestionSchema)
