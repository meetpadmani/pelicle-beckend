const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ─── Generate Access Token ────────────────────────────────────────────────────
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

// ─── Generate Refresh Token ───────────────────────────────────────────────────
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// ─── Generate Random Token (for password reset) ───────────────────────────────
exports.generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ─── Generate 6-digit OTP ─────────────────────────────────────────────────────
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Send token response ──────────────────────────────────────────────────────
exports.sendTokenResponse = (user, statusCode, res) => {
  const accessToken = exports.generateAccessToken(user._id);
  const refreshToken = exports.generateRefreshToken(user._id);

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
};
