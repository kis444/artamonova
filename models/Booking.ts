import mongoose, { Schema, models } from 'mongoose'

const bookingSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  programName: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentMethod: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  meetLink: { type: String, default: '' },
  price: { type: Number },
  createdAt: { type: Date, default: Date.now },
})

export const Booking = models.Booking || mongoose.model('Booking', bookingSchema)