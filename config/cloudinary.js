const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const hasValidCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           !process.env.CLOUDINARY_API_KEY.includes('your_');
const useCloudinary = hasValidCloudinary;
let cloudinary, uploadProductImages, uploadBannerImage, uploadCategoryImage, uploadLayoutImage, uploadGenericImage, uploadGenericVideo;

if (useCloudinary) {
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const productStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'pellicle/products', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] } });
  const bannerStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'pellicle/banners', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] } });
  const categoryStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'pellicle/categories', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'] } });
  const layoutStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'pellicle/layout', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'] } });
  const videoStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'pellicle/videos', resource_type: 'video', allowed_formats: ['mp4', 'webm'] } });

  uploadProductImages = multer({ storage: productStorage, limits: { fileSize: 5 * 1024 * 1024 } }).array('images', 6);
  uploadBannerImage = multer({ storage: bannerStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
  uploadCategoryImage = multer({ storage: categoryStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
  uploadLayoutImage = multer({ storage: layoutStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('logoImage');
  uploadGenericImage = multer({ storage: bannerStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
  uploadGenericVideo = multer({ storage: videoStorage, limits: { fileSize: 100 * 1024 * 1024 } }).single('video');
} else {
  // Local storage fallback
  cloudinary = { uploader: { destroy: async () => true } }; // Mock destroy for local

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  uploadProductImages = multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } }).array('images', 6);
  uploadBannerImage = multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
  uploadCategoryImage = multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
  uploadLayoutImage = multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('logoImage');
  uploadGenericImage = multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
  uploadGenericVideo = multer({ storage: localStorage, limits: { fileSize: 100 * 1024 * 1024 } }).single('video');
}

// Wrapper to normalize local path to a web URL (/uploads/...)
const normalizePath = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err) return next(err);
      if (!useCloudinary) {
        if (req.file) req.file.path = `/uploads/${req.file.filename}`;
        if (req.files) req.files.forEach(f => f.path = `/uploads/${f.filename}`);
      }
      next();
    });
  };
};

module.exports = { 
  cloudinary, 
  uploadProductImages: normalizePath(uploadProductImages), 
  uploadBannerImage: normalizePath(uploadBannerImage), 
  uploadCategoryImage: normalizePath(uploadCategoryImage),
  uploadLayoutImage: normalizePath(uploadLayoutImage),
  uploadGenericImage: normalizePath(uploadGenericImage),
  uploadGenericVideo: normalizePath(uploadGenericVideo)
};
