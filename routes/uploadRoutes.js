const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadGenericImage, uploadGenericVideo } = require('../config/cloudinary');

// POST /api/upload - Upload a single image, returns URL
router.post('/', protect, adminOnly, uploadGenericImage, (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
  res.json({ success: true, url: req.file.path, filename: req.file.filename });
});

// POST /api/upload/video - Upload a single video, returns URL
router.post('/video', protect, adminOnly, uploadGenericVideo, (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });
  res.json({ success: true, url: req.file.path, filename: req.file.filename });
});

module.exports = router;
