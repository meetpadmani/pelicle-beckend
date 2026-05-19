const mongoose = require('mongoose');

const layoutSchema = new mongoose.Schema({
  type: { type: String, default: 'main' },
  logo: {
    type: { type: String, default: 'text', enum: ['text', 'image'] },
    text: { type: String, default: 'Pelicle' },
    imageUrl: { type: String, default: '' }
  },
  announcements: [{ type: String }],
  ticker: { type: String, default: '' },
  siteSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  seo: { type: mongoose.Schema.Types.Mixed, default: {} },
  navbar: [{
    label: { type: String, required: true },
    url: { type: String },
    isHighlight: { type: Boolean, default: false },
    subLinks: [{
      label: { type: String },
      url: { type: String }
    }]
  }],
  features: [{
    icon: { type: String },
    title: { type: String },
    desc: { type: String }
  }],
  homeSections: {
    featured: {
      title: { type: String },
      subtitle: { type: String }
    },
    newArrivals: {
      title: { type: String },
      subtitle: { type: String }
    }
  },
  homeBuilder: [{
    id: { type: String },
    type: { type: String },
    title: { type: String },
    subtitle: { type: String },
    position: { type: Number },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  footer: {
    logoText: { type: String },
    logoImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    description: { type: String },
    phone: { type: String },
    email: { type: String },
    socials: {
      instagram: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      youtube: { type: String }
    },
    columns: [{
      title: { type: String },
      links: [{ label: String, url: String }]
    }]
  }
});

module.exports = mongoose.model('Layout', layoutSchema);
