const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true, parentCategory: null })
      .populate({ path: 'subcategories', select: 'name slug image' })
      .sort('order name');
    res.json({ success: true, count: categories.length, categories });
  } catch (error) { next(error); }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate('subcategories');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, order } = req.body;
    let image = {};
    if (req.file) {
      image = { url: req.file.path, publicId: req.file.filename };
    }
    const category = await Category.create({ name, description, parentCategory, order, image });
    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    if (req.file) {
      if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId);
      req.body.image = { url: req.file.path, publicId: req.file.filename };
    }
    
    if (req.body.parentCategory === '' || req.body.parentCategory === 'null') {
      req.body.parentCategory = null;
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Category updated.', category });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId);
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) { next(error); }
};
