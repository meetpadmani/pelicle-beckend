const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, required: true },
  color: {
    name: String,
    hex: String,
  },
  price: { type: Number, required: true }, // snapshot at add time
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  couponApplied: {
    code: String,
    discountAmount: { type: Number, default: 0 },
  },
}, { timestamps: true });

// ─── Virtual: total price ─────────────────────────────────────────────────────
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
