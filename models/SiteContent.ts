import mongoose, { Schema, models } from 'mongoose'

// This model stores editable site content (texts the admin can change)
const SiteContentSchema = new Schema({
  key: { type: String, required: true, unique: true },
  // key examples: 'hero.title.en', 'about.bio.ro', 'about.bio.ru'
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
})

export const SiteContent = models.SiteContent || mongoose.model('SiteContent', SiteContentSchema)