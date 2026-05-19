const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    if (!coupon.isValid()) return res.status(400).json({ success: false, message: 'Coupon is expired or inactive.' });

    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon.`,
      });
    }

    let discountAmount;
    if (coupon.discountType === 'flat') {
      discountAmount = coupon.value;
    } else {
      discountAmount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }

    res.json({
      success: true,
      message: 'Coupon applied!',
      coupon: { code: coupon.code, discountType: coupon.discountType, value: coupon.value },
      discountAmount: Math.round(discountAmount),
    });
  } catch (error) { next(error); }
};

// Admin CRUD
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created.', coupon });
  } catch (error) { next(error); }
};

exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) { next(error); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true, message: 'Coupon updated.', coupon });
  } catch (error) { next(error); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) { next(error); }
};
