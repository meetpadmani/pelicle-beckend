const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─── @GET /api/cart ───────────────────────────────────────────────────────────
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images price discountPrice stock sizes colors isActive',
    });

    if (!cart) return res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });

    // Remove items whose product no longer exists or is inactive
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    await cart.save();

    const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ success: true, cart, totalPrice, totalItems });
  } catch (error) { next(error); }
};

// ─── @POST /api/cart ──────────────────────────────────────────────────────────
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId || !size) {
      return res.status(400).json({ success: false, message: 'productId and size are required.' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product + size + color already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size &&
        item.color?.name === (color?.name || '')
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        color: color || {},
        price: product.discountPrice || product.price,
      });
    }

    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name images price discountPrice stock' });

    res.json({ success: true, message: 'Added to cart.', cart });
  } catch (error) { next(error); }
};

// ─── @PUT /api/cart/:itemId ───────────────────────────────────────────────────
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found.' });

    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name images price discountPrice stock' });

    res.json({ success: true, message: 'Cart updated.', cart });
  } catch (error) { next(error); }
};

// ─── @DELETE /api/cart/:itemId ────────────────────────────────────────────────
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart.', cart });
  } catch (error) { next(error); }
};

// ─── @DELETE /api/cart ────────────────────────────────────────────────────────
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], couponApplied: {} },
    );
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) { next(error); }
};
