const Review = require('../models/Review');
const Order = require('../models/Order');

exports.getProductReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt').skip(skip).limit(limit);

    const total = await Review.countDocuments({ product: req.params.productId, isApproved: true });

    res.json({ success: true, count: reviews.length, total, reviews });
  } catch (error) { next(error); }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }

    // Check if user has bought the product
    const purchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: 'delivered',
    });

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!purchased,
      isApproved: true, // auto-approve; change to false for moderation
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review added.', review });
  } catch (error) { next(error); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) { next(error); }
};

// Admin
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) { next(error); }
};

exports.toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    review.isApproved = !review.isApproved;
    await review.save();
    res.json({ success: true, message: `Review ${review.isApproved ? 'approved' : 'hidden'}.`, review });
  } catch (error) { next(error); }
};
