const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadCategoryImage } = require('../config/cloudinary');

router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, adminOnly, uploadCategoryImage, createCategory);
router.put('/:id', protect, adminOnly, uploadCategoryImage, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
