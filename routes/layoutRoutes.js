const express = require('express');
const router = express.Router();
const { getLayout, updateLayout } = require('../controllers/layoutController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadLayoutImage } = require('../config/cloudinary');

router.get('/', getLayout);
router.put('/', protect, adminOnly, uploadLayoutImage, updateLayout);

module.exports = router;
