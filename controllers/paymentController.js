const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── @POST /api/payment/create-order ─────────────────────────────────────────
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body; // amount in paise

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${orderId || Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/payment/verify ────────────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        'payment.status': 'paid',
        'payment.razorpayOrderId': razorpay_order_id,
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.razorpaySignature': razorpay_signature,
        'payment.paidAt': new Date(),
        status: 'processing',
        $push: { statusHistory: { status: 'processing', note: 'Payment received.' } },
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, message: 'Payment verified successfully.', order });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/payment/key ────────────────────────────────────────────────────
exports.getRazorpayKey = async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
};
