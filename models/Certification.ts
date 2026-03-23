import mongoose, { Schema, models } from 'mongoose'

const CertificationSchema = new Schema({
  titleEn: { type: String, required: true },
  titleRo: { type: String, default: '' },
  titleRu: { type: String, default: '' },
  issuer: { type: String, required: true },
  year: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Șterge modelul vechi dacă există pentru a forța reîncărcarea
if (mongoose.models.Certification) {
  delete mongoose.models.Certification
}

export const Certification = mongoose.model('Certification', CertificationSchema)
