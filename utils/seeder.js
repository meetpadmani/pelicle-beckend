require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');

connectDB();

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const categories = [
  { name: 'Men', slug: 'men', order: 1, image: { url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', publicId: '' } },
  { name: 'Women', slug: 'women', order: 2, image: { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', publicId: '' } },
  { name: 'Kids', slug: 'kids', order: 3, image: { url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=400', publicId: '' } },
  { name: 'Ethnic', slug: 'ethnic', order: 4, image: { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', publicId: '' } },
  { name: 'Western', slug: 'western', order: 5, image: { url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400', publicId: '' } },
];

const banners = [
  {
    title: 'New Season Collection',
    subtitle: 'Discover your signature style',
    image: { url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920', publicId: '' },
    link: '/products',
    buttonText: 'Shop Now',
    isActive: true,
    order: 1,
  },
  {
    title: 'Up to 60% Off',
    subtitle: 'Exclusive sale on premium brands',
    image: { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920', publicId: '' },
    link: '/products?sort=-discountPercent',
    buttonText: 'Shop Sale',
    isActive: true,
    order: 2,
  },
  {
    title: 'Ethnic Wear Fiesta',
    subtitle: 'Celebrate every occasion in style',
    image: { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1920', publicId: '' },
    link: '/category/ethnic',
    buttonText: 'Explore Now',
    isActive: true,
    order: 3,
  },
];

const coupons = [
  {
    code: 'PELLICLE10',
    description: '10% off on your first order',
    discountType: 'percentage',
    value: 10,
    maxDiscount: 500,
    minOrderAmount: 999,
    usageLimit: 1000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FLAT200',
    description: 'Flat ₹200 off on orders above ₹1499',
    discountType: 'flat',
    value: 200,
    minOrderAmount: 1499,
    usageLimit: 500,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'WELCOME25',
    description: '25% off for new users',
    discountType: 'percentage',
    value: 25,
    maxDiscount: 750,
    minOrderAmount: 1999,
    usageLimit: 200,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    console.log('🗑️  Clearing old data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Coupon.deleteMany({});

    // ─── Admin User ───────────────────────────────────────────────────────────
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'PELLICLE Admin',
      email: 'admin@pellicle.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9999999999',
      isVerified: true,
    });
    console.log(`   ✅ Admin: admin@pellicle.com / Admin@123`);

    // ─── Test User ────────────────────────────────────────────────────────────
    await User.create({
      name: 'Test User',
      email: 'user@pellicle.com',
      password: 'User@123',
      role: 'user',
      phone: '8888888888',
      isVerified: true,
    });
    console.log(`   ✅ User: user@pellicle.com / User@123`);

    // ─── Categories ───────────────────────────────────────────────────────────
    console.log('📦 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.slug] = c._id; });
    console.log(`   ✅ ${createdCategories.length} categories created`);

    // ─── Subcategories ────────────────────────────────────────────────────────
    const subcategories = [
      { name: "Men's T-Shirts", slug: 'mens-tshirts', parentCategory: catMap['men'] },
      { name: "Men's Jeans", slug: 'mens-jeans', parentCategory: catMap['men'] },
      { name: "Women's Dresses", slug: 'womens-dresses', parentCategory: catMap['women'] },
      { name: "Women's Tops", slug: 'womens-tops', parentCategory: catMap['women'] },
      { name: 'Kurtas', slug: 'kurtas', parentCategory: catMap['ethnic'] },
      { name: 'Sarees', slug: 'sarees', parentCategory: catMap['ethnic'] },
    ];
    await Category.insertMany(subcategories);

    // ─── Products ─────────────────────────────────────────────────────────────
    console.log('👕 Creating products...');
    const products = [
      {
        name: 'Premium Cotton Slim Fit T-Shirt',
        description: 'Crafted from 100% premium Pima cotton, this slim-fit t-shirt offers superior softness and breathability. Perfect for casual wear or layering.',
        price: 1299, discountPrice: 799,
        category: catMap['men'], brand: 'PELLICLE Basics', gender: 'Men',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Navy', hex: '#1a2a4a' }, { name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#000000' }],
        stock: 150, isFeatured: true, isNewArrival: true,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', publicId: '' }],
        tags: ['cotton', 'casual', 'slim-fit'], fit: 'Slim', material: '100% Pima Cotton',
      },
      {
        name: 'Floral Wrap Midi Dress',
        description: 'A flowing floral midi dress with a flattering wrap silhouette. Made from lightweight viscose for all-day comfort.',
        price: 2499, discountPrice: 1599,
        category: catMap['women'], brand: 'PELLICLE Studio', gender: 'Women',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [{ name: 'Rose Floral', hex: '#e8a0a0' }, { name: 'Blue Floral', hex: '#a0b4e8' }],
        stock: 80, isFeatured: true, isNewArrival: true,
        images: [{ url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800', publicId: '' }],
        tags: ['dress', 'floral', 'midi', 'summer'], fit: 'Regular', material: 'Viscose',
      },
      {
        name: 'Straight Fit Stretch Denim Jeans',
        description: 'Classic straight-fit jeans with premium stretch denim. 5-pocket styling with antique brass hardware.',
        price: 3499, discountPrice: 2199,
        category: catMap['men'], brand: 'PELLICLE Denim', gender: 'Men',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Dark Indigo', hex: '#1f2d5e' }, { name: 'Light Wash', hex: '#7b9ec8' }],
        stock: 120, isFeatured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', publicId: '' }],
        tags: ['jeans', 'denim', 'casual'], fit: 'Regular', material: '98% Cotton 2% Elastane',
      },
      {
        name: 'Embroidered Anarkali Kurta',
        description: 'Elegant floor-length Anarkali kurta with intricate thread embroidery. Pair with churidar and dupatta for a complete ethnic look.',
        price: 4999, discountPrice: 2999,
        category: catMap['ethnic'], brand: 'PELLICLE Ethnic', gender: 'Women',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Royal Blue', hex: '#2244aa' }, { name: 'Maroon', hex: '#800020' }, { name: 'Bottle Green', hex: '#006400' }],
        stock: 60, isFeatured: true, isNewArrival: true,
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', publicId: '' }],
        tags: ['kurta', 'ethnic', 'anarkali', 'embroidered'], material: 'Georgette',
      },
      {
        name: 'Oversized Graphic Hoodie',
        description: 'Ultra-soft 320gsm fleece hoodie with a bold graphic print. Features a kangaroo pocket and adjustable drawstring.',
        price: 2299, discountPrice: 1499,
        category: catMap['western'], brand: 'PELLICLE Street', gender: 'Unisex',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Charcoal', hex: '#36454f' }, { name: 'Dusty Rose', hex: '#dcae96' }],
        stock: 200, isNewArrival: true,
        images: [{ url: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800', publicId: '' }],
        tags: ['hoodie', 'oversized', 'graphic', 'casual'], fit: 'Oversized', material: 'Fleece',
      },
      {
        name: "Kids' Cartoon Print T-Shirt Pack of 3",
        description: 'Fun and vibrant cartoon print t-shirts in a pack of 3. Made from soft, skin-friendly cotton.',
        price: 1599, discountPrice: 999,
        category: catMap['kids'], brand: 'PELLICLE Mini', gender: 'Kids',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [{ name: 'Multi', hex: '#ff6b6b' }],
        stock: 300, isFeatured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800', publicId: '' }],
        tags: ['kids', 'tshirt', 'cartoon', 'pack'], material: '100% Cotton',
      },
      {
        name: 'Linen Blend Co-ord Set',
        description: 'Breezy linen-blend co-ord set featuring a relaxed blazer and wide-leg trousers. Minimalist sophistication for any occasion.',
        price: 5999, discountPrice: 3799,
        category: catMap['women'], brand: 'PELLICLE Studio', gender: 'Women',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [{ name: 'Beige', hex: '#c8b89a' }, { name: 'Sage Green', hex: '#8fae88' }],
        stock: 45, isFeatured: true, isNewArrival: true,
        images: [{ url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800', publicId: '' }],
        tags: ['coord-set', 'linen', 'minimal', 'western'], fit: 'Loose', material: '55% Linen 45% Viscose',
      },
      {
        name: 'Polo Club Classic Shirt',
        description: 'Timeless polo shirt crafted from premium mercerized cotton piqué. Ribbed collar and cuffs with a 2-button placket.',
        price: 1799, discountPrice: 1099,
        category: catMap['men'], brand: 'PELLICLE Club', gender: 'Men',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Forest Green', hex: '#228b22' }, { name: 'Navy', hex: '#000080' }, { name: 'Burgundy', hex: '#800020' }],
        stock: 180, isFeatured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800', publicId: '' }],
        tags: ['polo', 'casual', 'classic'], fit: 'Regular', material: 'Mercerized Cotton Piqué',
      },
    ];

    for (const p of products) { await Product.create(p); }
    console.log(`   ✅ ${products.length} products created`);

    // ─── Banners ──────────────────────────────────────────────────────────────
    console.log('🖼️  Creating banners...');
    await Banner.insertMany(banners);
    console.log(`   ✅ ${banners.length} banners created`);

    // ─── Coupons ──────────────────────────────────────────────────────────────
    console.log('🎟️  Creating coupons...');
    await Coupon.insertMany(coupons);
    console.log(`   ✅ ${coupons.length} coupons created`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:  admin@pellicle.com  / Admin@123');
    console.log('User:   user@pellicle.com   / User@123');
    console.log('Coupons: PELLICLE10 | FLAT200 | WELCOME25');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  }
};

seedDB();
