const Page = require('../models/Page');
const slugify = require('slugify');

// GET /api/pages — public (list published pages)
exports.getPages = async (req, res, next) => {
  try {
    const pages = await Page.find({}).sort({ createdAt: -1 });
    res.json({ success: true, pages });
  } catch (err) { next(err); }
};

// GET /api/pages/:slug — public
exports.getPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (err) { next(err); }
};

// POST /api/pages — admin only
exports.createPage = async (req, res, next) => {
  try {
    const { title, slug, content, isPublished, metaTitle, metaDescription } = req.body;
    const finalSlug = slug ? slug.toLowerCase().trim().replace(/\s+/g, '-') : slugify(title, { lower: true, strict: true });
    const page = await Page.create({ title, slug: finalSlug, content, isPublished, metaTitle, metaDescription });
    res.status(201).json({ success: true, page });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'A page with this slug already exists.' });
    next(err);
  }
};

// PUT /api/pages/:id — admin only
exports.updatePage = async (req, res, next) => {
  try {
    const { title, slug, content, isPublished, metaTitle, metaDescription } = req.body;
    const updateData = { title, content, isPublished, metaTitle, metaDescription };
    if (slug) updateData.slug = slug.toLowerCase().trim().replace(/\s+/g, '-');
    const page = await Page.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'A page with this slug already exists.' });
    next(err);
  }
};

// DELETE /api/pages/:id — admin only
exports.deletePage = async (req, res, next) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) { next(err); }
};
