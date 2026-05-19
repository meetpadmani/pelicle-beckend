require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const layoutRoutes = require('./routes/layoutRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRuleRoutes = require('./routes/notificationRuleRoutes');
const pageRoutes = require('./routes/pageRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Static Uploads (Bypass Helmet for Images) ──────────────────────────────
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/;
    if (allowed.test(origin)) {
      return callback(null, true);
    }
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);


// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PELLICLE API is running 🚀', timestamp: new Date() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/layout', layoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notification-rules', notificationRuleRoutes);
app.use('/api/pages', pageRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  const c = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    green:   '\x1b[38;2;80;200;120m',
    cyan:    '\x1b[38;2;100;210;210m',
    gold:    '\x1b[38;2;201;165;90m',
    white:   '\x1b[97m',
    gray:    '\x1b[90m',
    magenta: '\x1b[38;2;200;120;220m',
    red:     '\x1b[91m',
    blue:    '\x1b[38;2;100;160;255m',
    cream:   '\x1b[38;2;245;240;232m',
  };

  const W = 58;
  const pad = (str, len) => str + ' '.repeat(Math.max(0, len - stripAnsi(str)));
  const stripAnsi = s => s.replace(/\x1b\[[^m]*m/g, '');

  const box = {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│', ml: '├', mr: '┤',
  };

  const edge  = `${c.gray}${box.v}${c.reset}`;
  const top   = `${c.gray}${box.tl}${'─'.repeat(W)}${box.tr}${c.reset}`;
  const mid   = `${c.gray}${box.ml}${'─'.repeat(W)}${box.mr}${c.reset}`;
  const bot   = `${c.gray}${box.bl}${'─'.repeat(W)}${box.br}${c.reset}`;
  const empty = `${edge}${' '.repeat(W)}${edge}`;

  const center = (text) => {
    const vis = stripAnsi(text);
    const total = W;
    const left  = Math.floor((total - vis.length) / 2);
    const right = total - vis.length - left;
    return `${edge}${' '.repeat(left)}${text}${' '.repeat(right)}${edge}`;
  };

  const row = (icon, label, value, vc = c.cyan) => {
    const left = `  ${icon}  ${c.dim}${c.gray}${label}${c.reset}`;
    const right = `${vc}${c.bold}${value}${c.reset}`;
    const visLeft = stripAnsi(left);
    const visRight = stripAnsi(right);
    const spaces = Math.max(1, W - visLeft.length - visRight.length - 2);
    return `${edge}${left}${' '.repeat(spaces)}${right}  ${edge}`;
  };

  const divider = (label) => {
    const l = ` ${label} `;
    const rem = W - l.length;
    const lpad = Math.floor(rem / 2);
    const rpad = rem - lpad;
    return `${c.gray}${box.ml}${'─'.repeat(lpad)}${c.reset}${c.dim}${c.gold}${l}${c.reset}${c.gray}${'─'.repeat(rpad)}${box.mr}${c.reset}`;
  };

  const now = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
  const env = (process.env.NODE_ENV || 'development');
  const envColor = env === 'production' ? c.green : c.gold;
  const host = HOST === '0.0.0.0' ? 'localhost' : HOST;

  process.stdout.write('\n');
  console.log(top);
  console.log(empty);
  console.log(center(`${c.bold}${c.cream}✦   P E L I C L E   S E R V E R   ✦${c.reset}`));
  console.log(center(`${c.dim}${c.gold}Move Freely. Stay Stylish.${c.reset}`));
  console.log(empty);
  console.log(mid);
  console.log(empty);
  console.log(row('⚡', 'Status  ', 'LIVE & RUNNING', c.green));
  console.log(row('🌐', 'Server  ', `http://${host}:${PORT}`, c.cyan));
  console.log(row('🔗', 'Health  ', `http://${host}:${PORT}/api/health`, c.blue));
  console.log(row('📦', 'Env     ', env.toUpperCase(), envColor));
  console.log(row('🕐', 'Time    ', `${now}  —  ${date}`, c.magenta));
  console.log(empty);
  console.log(divider('API ROUTES'));
  console.log(empty);
  console.log(row('🔑', 'Auth    ', '/api/auth', c.cream));
  console.log(row('👕', 'Products', '/api/products', c.cream));
  console.log(row('🛒', 'Cart    ', '/api/cart  •  /api/orders', c.cream));
  console.log(row('📤', 'Upload  ', '/api/upload', c.cream));
  console.log(row('🎨', 'Layout  ', '/api/layout  •  /api/banners', c.cream));
  console.log(empty);
  console.log(divider('DATABASE'));
  console.log(empty);
});

module.exports = app;
