const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ─── Totals ───────────────────────────────────────────────────────────────
    const [totalOrders, totalUsers, totalProducts, totalReviews] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Review.countDocuments(),
    ]);

    // ─── Revenue ──────────────────────────────────────────────────────────────
    const revenueAgg = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly Revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const lastMonthRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // ─── Sales by Month (last 6 months) ──────────────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // ─── Order Status Breakdown ───────────────────────────────────────────────
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // ─── Recent Orders ────────────────────────────────────────────────────────
    const recentOrders = await Order.find()
      .sort('-createdAt').limit(10)
      .populate('user', 'name email')
      .select('orderNumber totalAmount status createdAt payment');

    // ─── Low Stock Products ───────────────────────────────────────────────────
    const lowStockProducts = await Product.find({ stock: { $lte: 5 }, isActive: true })
      .select('name stock images').limit(10);

    // ─── Top Products ──────────────────────────────────────────────────────────
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { 'product.name': 1, 'product.images': 1, totalSold: 1, revenue: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalReviews,
        totalRevenue,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
        monthlySales,
        ordersByStatus,
        recentOrders,
        lowStockProducts,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
