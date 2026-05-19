const User = require('../models/User');

// ─── @GET /api/users/profile ──────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// ─── @PUT /api/users/profile ──────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (error) { next(error); }
};

// ─── @PUT /api/users/change-password ─────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) { next(error); }
};

// ─── Address Management ───────────────────────────────────────────────────────
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // If this is first address or set as default, unset others
    if (req.body.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(a => { a.isDefault = false; });
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, message: 'Address added.', addresses: user.addresses });
  } catch (error) { next(error); }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });

    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, message: 'Address updated.', addresses: user.addresses });
  } catch (error) { next(error); }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, message: 'Address deleted.', addresses: user.addresses });
  } catch (error) { next(error); }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach(a => { a.isDefault = a._id.toString() === req.params.addressId; });
    await user.save();
    res.json({ success: true, message: 'Default address updated.', addresses: user.addresses });
  } catch (error) { next(error); }
};

// ─── Admin: Get all users ─────────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find().select('-refreshToken').sort('-createdAt').skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.json({ success: true, count: users.length, total, users });
  } catch (error) { next(error); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block admin.' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) { next(error); }
};

// ─── Admin: Create Admin User ──────────────────────────────────────────────────
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully.',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) { next(error); }
};
