const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: { type: String, unique: true, lowercase: true },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  shortDescription: { type: String },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
    default: 0,
    min: [0, 'Discount price cannot be negative'],
  },
  discountPercent: { type: Number, default: 0 },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String },
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  subCategory: { type: String },
  brand: { type: String, trim: true },
  sizes: [{ type: String }],
  colors: [
    {
      name: String,
      hex: String,
    },
  ],
  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  styleCode: { type: String },
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
  benefits: [String],
  fabric: String,
  material: String,
  washCare: [String],
  careInstructions: String,
  pattern: String,
  sleeve: String,
  countryOfOrigin: String,
  occasion: [String],
  fit: { type: String },
  gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], required: true },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, { timestamps: true });

// ─── Auto-generate slug ───────────────────────────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  // Calculate discount percent
  if (this.price && this.discountPrice) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isNewArrival: 1 });

module.exports = mongoose.model('Product', productSchema);
