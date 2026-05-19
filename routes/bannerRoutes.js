const express = require('express');
const router = express.Router();
const { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadBannerImage } = require('../config/cloudinary');

router.get('/', getActiveBanners);
router.get('/admin/all', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, uploadBannerImage, createBanner);
router.put('/:id', protect, adminOnly, uploadBannerImage, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
