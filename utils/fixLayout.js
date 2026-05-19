require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const layoutSchema = new mongoose.Schema({
  logoImage: String
}, { strict: false });

const Layout = mongoose.models.Layout || mongoose.model('Layout', layoutSchema);

const fixLayout = async () => {
  try {
    await connectDB();
    const layouts = await Layout.find({});
    for (let layout of layouts) {
      if (layout.logoImage && layout.logoImage.includes('192.168.1.7:5000')) {
        layout.logoImage = layout.logoImage.replace('http://192.168.1.7:5000', '');
        await layout.save();
        console.log('Fixed logo URL:', layout.logoImage);
      }
    }
    console.log('Layout fixed!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixLayout();
