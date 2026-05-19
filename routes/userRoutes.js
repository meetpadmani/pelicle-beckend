const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, changePassword,
  addAddress, updateAddress, deleteAddress, setDefaultAddress,
  getAllUsers, getUserById, toggleBlockUser, createAdmin
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── User Routes (protected) ──────────────────────────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, getAllUsers);
router.post('/admin', protect, adminOnly, createAdmin);
router.get('/:id', protect, adminOnly, getUserById);
router.patch('/:id/block', protect, adminOnly, toggleBlockUser);

module.exports = router;
