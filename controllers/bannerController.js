const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

exports.getActiveBanners = async (req, res, next) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      $or: [
        { validFrom: null, validUntil: null },
        { validFrom: { $lte: now }, validUntil: { $gte: now } },
        { validFrom: { $lte: now }, validUntil: null },
      ],
    }).sort('order');
    res.json({ success: true, count: banners.length, banners });
  } catch (error) { next(error); }
};

exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('order');
    res.json({ success: true, count: banners.length, banners });
  } catch (error) { next(error); }
};

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, link, buttonText, showButton, order, isActive, validFrom, validUntil } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Banner image is required.' });

    const banner = await Banner.create({
      title, subtitle, link, buttonText, showButton: showButton !== 'false' && showButton !== false, order, isActive, validFrom, validUntil,
      image: { url: req.file.path, publicId: req.file.filename },
    });
    res.status(201).json({ success: true, message: 'Banner created.', banner });
  } catch (error) { next(error); }
};

exports.updateBanner = async (req, res, next) => {
  try {
    let banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });

    if (req.file) {
      if (banner.image?.publicId) await cloudinary.uploader.destroy(banner.image.publicId);
      req.body.image = { url: req.file.path, publicId: req.file.filename };
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Banner updated.', banner });
  } catch (error) { next(error); }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
    if (banner.image?.publicId) await cloudinary.uploader.destroy(banner.image.publicId);
    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (error) { next(error); }
};
