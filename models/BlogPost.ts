import mongoose, { Schema, models } from 'mongoose'

const BlogPostSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  titleEn: { type: String, required: true },
  titleRo: { type: String, default: '' },
  titleRu: { type: String, default: '' },
  excerptEn: { type: String, default: '' },
  excerptRo: { type: String, default: '' },
  excerptRu: { type: String, default: '' },
  contentEn: { type: String, default: '' },
  contentRo: { type: String, default: '' },
  contentRu: { type: String, default: '' },
  coverImage: { type: String, default: '' }, // base64 or URL
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const BlogPost = models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)