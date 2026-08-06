const mongoose = require('mongoose');
const { getIsMongoConnected } = require('../config/db');

// Mongoose Schema
const AdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  advertiser: { type: String, default: 'Prince Ads Sponsor' },
  adType: { type: String, enum: ['image', 'video', 'html'], default: 'image' },
  mediaUrl: { type: String, required: true },
  htmlContent: { type: String, default: '' },
  targetUrl: { type: String, default: 'https://prince-studios.com' },
  ctaText: { type: String, default: 'Learn More' },
  placement: [{ type: String, enum: ['preshow', 'intermission', 'banner', 'popup', 'sidebar'] }],
  priority: { type: Number, default: 5, min: 1, max: 10 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  targetPages: [{ type: String }],
  isActive: { type: Boolean, default: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const AdModel = mongoose.model('Ad', AdSchema);

// In-Memory Fallback Storage
let memoryAds = [
  {
    _id: 'ad-101',
    title: 'PRINCE STUDIOS VIP Platinum Membership',
    advertiser: 'PRINCE STUDIOS',
    adType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    htmlContent: '',
    targetUrl: 'https://prince-studios.com/vip',
    ctaText: 'Get VIP Pass',
    placement: ['preshow', 'intermission', 'banner', 'popup'],
    priority: 10,
    startDate: new Date(),
    endDate: null,
    targetPages: ['/cinema', '/vip'],
    isActive: true,
    impressions: 482,
    clicks: 124,
    createdAt: new Date()
  },
  {
    _id: 'ad-102',
    title: 'Dolby Atmos 3D Spatial Audio Showcase',
    advertiser: 'Dolby Labs',
    adType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    htmlContent: '',
    targetUrl: 'https://dolby.com',
    ctaText: 'Discover Sound',
    placement: ['preshow', 'intermission'],
    priority: 8,
    startDate: new Date(),
    endDate: null,
    targetPages: ['/cinema'],
    isActive: true,
    impressions: 310,
    clicks: 68,
    createdAt: new Date()
  },
  {
    _id: 'ad-103',
    title: 'Neo-Tokyo VR Cinema Headset 8K',
    advertiser: 'CyberTech Labs',
    adType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop',
    htmlContent: '',
    targetUrl: 'https://cybertech.example.com',
    ctaText: '25% Off Gear',
    placement: ['banner', 'popup', 'sidebar'],
    priority: 9,
    startDate: new Date(),
    endDate: null,
    targetPages: ['/store', '/gear'],
    isActive: true,
    impressions: 215,
    clicks: 43,
    createdAt: new Date()
  },
  {
    _id: 'ad-104',
    title: 'Interactive HTML 5 Promo Widget',
    advertiser: 'Prince Media Group',
    adType: 'html',
    mediaUrl: '',
    htmlContent: '<div style="background: linear-gradient(135deg, #0284c7, #2563eb); color: white; padding: 20px; border-radius: 16px; text-align: center;"><h3 style="margin:0; font-size:18px;">🔥 Special Limited Ticket Sale!</h3><p style="font-size:12px; margin: 8px 0 14px 0;">Use Promo Code: PRINCE50 for 50% Off VIP Seats</p><a href="https://prince-studios.com" target="_blank" style="background:white; color:black; padding:8px 16px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:12px;">Claim Discount</a></div>',
    targetUrl: 'https://prince-studios.com',
    ctaText: 'Claim 50% Off',
    placement: ['banner', 'popup', 'sidebar'],
    priority: 7,
    startDate: new Date(),
    endDate: null,
    targetPages: ['/all'],
    isActive: true,
    impressions: 189,
    clicks: 52,
    createdAt: new Date()
  }
];

class AdStore {
  static async getAll(filter = {}) {
    if (getIsMongoConnected()) {
      return await AdModel.find(filter).sort({ priority: -1, createdAt: -1 });
    }
    let result = [...memoryAds];
    if (filter.placement) {
      result = result.filter(ad => ad.placement.includes(filter.placement));
    }
    if (filter.adType) {
      result = result.filter(ad => ad.adType === filter.adType);
    }
    if (filter.isActive !== undefined) {
      result = result.filter(ad => ad.isActive === filter.isActive);
    }
    return result.sort((a, b) => b.priority - a.priority);
  }

  static async getById(id) {
    if (getIsMongoConnected()) {
      return await AdModel.findById(id);
    }
    return memoryAds.find(a => a._id === id || a.id === id);
  }

  static async getRandomByPlacement(placement, adType = null) {
    const ads = await this.getAll({ placement, isActive: true });
    let eligible = ads;
    if (adType) {
      eligible = ads.filter(a => a.adType === adType);
    }
    if (eligible.length === 0) return null;

    // Weighted random selection based on priority
    const totalWeight = eligible.reduce((acc, ad) => acc + (ad.priority || 1), 0);
    let rand = Math.random() * totalWeight;

    for (const ad of eligible) {
      if (rand < (ad.priority || 1)) return ad;
      rand -= (ad.priority || 1);
    }
    return eligible[0];
  }

  static async create(data) {
    if (getIsMongoConnected()) {
      const newAd = new AdModel(data);
      return await newAd.save();
    }
    const newAd = {
      _id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      advertiser: data.advertiser || 'Prince Ads Sponsor',
      adType: data.adType || 'image',
      mediaUrl: data.mediaUrl || '',
      htmlContent: data.htmlContent || '',
      targetUrl: data.targetUrl || 'https://prince-studios.com',
      ctaText: data.ctaText || 'Learn More',
      placement: data.placement && data.placement.length > 0 ? data.placement : ['banner'],
      priority: Number(data.priority) || 5,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      targetPages: data.targetPages || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      impressions: 0,
      clicks: 0,
      createdAt: new Date()
    };
    memoryAds.unshift(newAd);
    return newAd;
  }

  static async update(id, updates) {
    if (getIsMongoConnected()) {
      return await AdModel.findByIdAndUpdate(id, updates, { new: true });
    }
    const idx = memoryAds.findIndex(a => a._id === id || a.id === id);
    if (idx === -1) return null;
    memoryAds[idx] = { ...memoryAds[idx], ...updates };
    return memoryAds[idx];
  }

  static async delete(id) {
    if (getIsMongoConnected()) {
      return await AdModel.findByIdAndDelete(id);
    }
    const initLen = memoryAds.length;
    memoryAds = memoryAds.filter(a => a._id !== id && a.id !== id);
    return memoryAds.length !== initLen;
  }

  static async recordImpression(id) {
    if (getIsMongoConnected()) {
      return await AdModel.findByIdAndUpdate(id, { $inc: { impressions: 1 } }, { new: true });
    }
    const ad = memoryAds.find(a => a._id === id || a.id === id);
    if (ad) {
      ad.impressions += 1;
    }
    return ad;
  }

  static async recordClick(id) {
    if (getIsMongoConnected()) {
      return await AdModel.findByIdAndUpdate(id, { $inc: { clicks: 1 } }, { new: true });
    }
    const ad = memoryAds.find(a => a._id === id || a.id === id);
    if (ad) {
      ad.clicks += 1;
    }
    return ad;
  }
}

module.exports = AdStore;
