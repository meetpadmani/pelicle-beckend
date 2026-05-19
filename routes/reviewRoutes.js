const express = require('express');
const router = express.Router();
const {
  getProductReviews, addReview, deleteReview, getAllReviews, toggleReviewApproval,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, addReview);
router.delete('/:reviewId', protect, deleteReview);
router.get('/', protect, adminOnly, getAllReviews);
router.patch('/:reviewId/approve', protect, adminOnly, toggleReviewApproval);

module.exports = router;
