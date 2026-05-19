const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [{ url: String, publicId: String }],
  isApproved: { type: Boolean, default: false },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// ─── Update product ratings after save ───────────────────────────────────────
reviewSchema.post('save', async function () {
  await updateProductRating(this.product);
});

reviewSchema.post('remove', async function () {
  await updateProductRating(this.product);
});

async function updateProductRating(productId) {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { ratings: 0, numReviews: 0 });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
