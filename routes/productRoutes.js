const express = require('express');
const router = express.Router();
const {
  getProducts, getFeaturedProducts, getNewArrivals,
  getProductById, getProductBySlug, getRelatedProducts,
  createProduct, updateProduct, deleteProduct, deleteProductImage,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../config/cloudinary');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/slug/:slug', getProductBySlug);
router.get('/related/:id', getRelatedProducts);
router.get('/:id', getProductById);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, uploadProductImages, createProduct);
router.put('/:id', protect, adminOnly, uploadProductImages, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:publicId', protect, adminOnly, deleteProductImage);

module.exports = router;
