const express = require('express');
const router = express.Router();
const { getPages, getPageBySlug, createPage, updatePage, deletePage } = require('../controllers/pageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getPages);
router.get('/:slug', getPageBySlug);
router.post('/', protect, adminOnly, createPage);
router.put('/:id', protect, adminOnly, updatePage);
router.delete('/:id', protect, adminOnly, deletePage);

module.exports = router;
