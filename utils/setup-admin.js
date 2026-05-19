require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const setupNewAdmin = async () => {
  try {
    await connectDB();
    console.log('🗑️  Removing all existing admin users...');
    await User.deleteMany({ role: 'admin' });
    
    console.log('👤 Creating fresh admin user...');
    await User.create({
      name: 'Meet Admin',
      email: 'meet@pellicle.com',
      password: '12345678',
      role: 'admin',
      phone: '9999999999',
      isVerified: true,
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Username/Email: meet');
    console.log('Password: 12345678');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
};

setupNewAdmin();
