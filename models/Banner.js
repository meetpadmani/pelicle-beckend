const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  subtitle: { type: String, trim: true },
  image: {
    url: { type: String, required: true },
    publicId: { type: String },
  },
  link: { type: String, default: '/' },
  buttonText: { type: String, default: 'Shop Now' },
  showButton: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  validFrom: { type: Date },
  validUntil: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
