const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');
const { cloudinary } = require('../config/cloudinary');

// ─── @GET /api/products ───────────────────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const baseQuery = Product.find({ isActive: true }).populate('category', 'name slug');

    const features = new ApiFeatures(baseQuery, req.query)
      .search()
      .filter()
      .sort()
      .paginate();

    const products = await features.query;
    const totalProducts = await Product.countDocuments({ isActive: true });

    res.json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / (features.limit || 12)),
      currentPage: features.page || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/products/featured ─────────────────────────────────────────────
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort('-createdAt');

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/products/new-arrivals ─────────────────────────────────────────
exports.getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isNewArrival: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort('-createdAt');

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/products/:id ───────────────────────────────────────────────────
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/products/slug/:slug ───────────────────────────────────────────
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/products/related/:id ──────────────────────────────────────────
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(6).populate('category', 'name slug');

    res.json({ success: true, count: relatedProducts.length, products: relatedProducts });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/products (Admin) ──────────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, discountPrice, category, brand,
      sizes, colors, stock, isFeatured, isNewArrival, tags,
      material, careInstructions, fit, gender, sku,
    } = req.body;

    // Handle images from Cloudinary upload
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    } else if (req.body.images) {
      // Accept image URLs directly (from frontend or seeding)
      let imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      images = imgs.map((img) => (typeof img === 'string' ? { url: img, publicId: '' } : img));
    }

    const product = await Product.create({
      name, description, price, discountPrice, category, brand,
      sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',')) : [],
      colors: colors ? (typeof colors === 'string' ? JSON.parse(colors) : colors) : [],
      stock, isFeatured, isNewArrival, tags,
      material, careInstructions, fit, gender, sku, images,
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/products/:id (Admin) ──────────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // If new images uploaded, append
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      req.body.images = [...(product.images || []), ...newImages];
    } else if (req.body.images) {
      // Normalize images array
      let imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      req.body.images = imgs.map(img => typeof img === 'string' ? { url: img, publicId: '' } : img);
    }

    // Parse colors if string
    if (req.body.colors && typeof req.body.colors === 'string') {
      req.body.colors = JSON.parse(req.body.colors);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Product updated.', product });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/products/:id (Admin) ────────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/products/:id/images/:publicId (Admin) ───────────────────────
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { publicId } = req.params;
    await cloudinary.uploader.destroy(decodeURIComponent(publicId));

    product.images = product.images.filter((img) => img.publicId !== decodeURIComponent(publicId));
    await product.save();

    res.json({ success: true, message: 'Image deleted.', product });
  } catch (error) {
    next(error);
  }
};
