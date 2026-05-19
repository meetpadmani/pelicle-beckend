const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({ path: 'products', select: 'name images price discountPrice ratings isActive' });

    if (!wishlist) {
      wishlist = { products: [] };
    } else {
      wishlist.products = wishlist.products.filter(p => p.isActive);
    }

    res.json({ success: true, wishlist });
  } catch (error) { next(error); }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required.' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
      await wishlist.save();
      return res.json({ success: true, message: 'Added to wishlist.', added: true });
    }

    const isInWishlist = wishlist.products.includes(productId);

    if (isInWishlist) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
      return res.json({ success: true, message: 'Removed from wishlist.', added: false });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ success: true, message: 'Added to wishlist.', added: true });
    }
  } catch (error) { next(error); }
};
