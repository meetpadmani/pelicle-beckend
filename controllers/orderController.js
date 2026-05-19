const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendOrderConfirmationEmail } = require('../utils/emailUtils');

// ─── @POST /api/orders ────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Shipping address and payment method are required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Validate stock & build order items
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${item.product.name}" is no longer available.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}".` });
      }

      const price = product.discountPrice || product.price;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      itemsPrice += price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    // Coupon
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid() && itemsPrice >= coupon.minOrderAmount) {
        if (coupon.discountType === 'flat') {
          discountAmount = coupon.value;
        } else {
          discountAmount = (itemsPrice * coupon.value) / 100;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }

    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxAmount = Math.round(itemsPrice * 0.05); // 5% GST
    const totalAmount = itemsPrice + shippingPrice + taxAmount - discountAmount;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
      },
      itemsPrice,
      shippingPrice,
      discountAmount,
      couponCode: couponCode?.toUpperCase(),
      taxAmount,
      totalAmount,
      notes,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      statusHistory: [{ status: 'pending', note: 'Order placed.' }],
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponApplied: {} });

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, order);
    } catch (_) { /* non-blocking */ }

    res.status(201).json({ success: true, message: 'Order placed successfully.', order });
  } catch (error) { next(error); }
};

// ─── @GET /api/orders/my ─────────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt').skip(skip).limit(limit)
      .populate('items.product', 'name images');

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({ success: true, count: orders.length, total, orders });
  } catch (error) { next(error); }
};

// ─── @GET /api/orders/:id ─────────────────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Users can only see their own orders
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// ─── @PUT /api/orders/:id/cancel ─────────────────────────────────────────────
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is ${order.status}.` });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({ status: 'cancelled', note: order.cancelReason });
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) { next(error); }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter['payment.status'] = req.query.paymentStatus;

    const orders = await Order.find(filter)
      .sort('-createdAt').skip(skip).limit(limit)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    const total = await Order.countDocuments(filter);

    res.json({ success: true, count: orders.length, total, orders });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingId } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }
    if (trackingId) order.trackingId = trackingId;
    order.statusHistory.push({ status, note });

    await order.save();
    res.json({ success: true, message: 'Order status updated.', order });
  } catch (error) { next(error); }
};
