const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: { type: String },
  discountType: {
    type: String,
    enum: ['flat', 'percentage'],
    required: true,
  },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number }, // cap for percentage coupons
  minOrderAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Check if coupon is still valid ──────────────────────────────────────────
couponSchema.methods.isValid = function () {
  return this.isActive && this.expiryDate > new Date() && this.usedCount < this.usageLimit;
};

module.exports = mongoose.model('Coupon', couponSchema);
