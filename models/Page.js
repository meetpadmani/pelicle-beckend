const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  content: { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
