const Layout = require('../models/Layout');

exports.getLayout = async (req, res, next) => {
  try {
    let layout = await Layout.findOne({ type: 'main' });
    if (!layout) {
      layout = await Layout.create({ type: 'main', navbar: [], features: [], homeBuilder: [], footer: { columns: [] } });
      return res.json({ success: true, layout });
    }
    res.json({ success: true, layout });
  } catch (error) { next(error); }
};

exports.updateLayout = async (req, res, next) => {
  try {
    let layout = await Layout.findOne({ type: 'main' });
    if (!layout) layout = new Layout({ type: 'main' });
    
    // Parse strings back to objects if sent via FormData
    let navbar = req.body.navbar;
    let footer = req.body.footer;
    let features = req.body.features;
    let homeSections = req.body.homeSections;
    let homeBuilder = req.body.homeBuilder;

    if (typeof navbar === 'string') {
      try { navbar = JSON.parse(navbar); } catch (e) {}
    }
    if (typeof footer === 'string') {
      try { footer = JSON.parse(footer); } catch (e) {}
    }
    if (typeof features === 'string') {
      try { features = JSON.parse(features); } catch (e) {}
    }
    if (typeof homeSections === 'string') {
      try { homeSections = JSON.parse(homeSections); } catch (e) {}
    }
    if (typeof homeBuilder === 'string') {
      try { homeBuilder = JSON.parse(homeBuilder); } catch (e) {}
    }

    if (navbar) {
      layout.set('navbar', navbar);
      layout.markModified('navbar');
    }
    if (features) {
      layout.set('features', features);
      layout.markModified('features');
    }
    if (homeSections) {
      layout.set('homeSections', homeSections);
      layout.markModified('homeSections');
    }
    if (homeBuilder) {
      layout.set('homeBuilder', homeBuilder);
      layout.markModified('homeBuilder');
    }
    let logo = req.body.logo;
    if (typeof logo === 'string') {
      try { logo = JSON.parse(logo); } catch (e) {}
    }
    if (logo) {
      layout.set('logo', logo);
      layout.markModified('logo');
    }

    let announcements = req.body.announcements;
    if (typeof announcements === 'string') {
      try { announcements = JSON.parse(announcements); } catch (e) {}
    }
    if (announcements) {
      layout.set('announcements', announcements);
      layout.markModified('announcements');
    }

    let ticker = req.body.ticker;
    if (ticker !== undefined) {
      layout.set('ticker', ticker);
      layout.markModified('ticker');
    }

    let siteSettings = req.body.siteSettings;
    if (typeof siteSettings === 'string') {
      try { siteSettings = JSON.parse(siteSettings); } catch (e) {}
    }
    if (siteSettings !== undefined) {
      layout.set('siteSettings', siteSettings);
      layout.markModified('siteSettings');
    }

    let seo = req.body.seo;
    if (typeof seo === 'string') {
      try { seo = JSON.parse(seo); } catch (e) {}
    }
    if (seo !== undefined) {
      layout.set('seo', seo);
      layout.markModified('seo');
    }

    if (footer) {
      if (req.file) {
        if (layout.footer?.logoImage?.publicId) {
          await require('../config/cloudinary').cloudinary.uploader.destroy(layout.footer.logoImage.publicId).catch(() => {});
        }
        footer.logoImage = { url: req.file.path, publicId: req.file.filename };
      } else {
        // Keep existing logoImage if no new file is uploaded
        const existingLogo = layout.footer?.logoImage;
        footer.logoImage = {
          url: existingLogo?.url || '',
          publicId: existingLogo?.publicId || ''
        };
      }
      layout.set('footer', footer);
      layout.markModified('footer');
    }
    
    await layout.save();
    res.json({ success: true, message: 'Layout updated', layout });
  } catch (error) { next(error); }
};
