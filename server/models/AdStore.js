const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ADS_FILE = path.join(DATA_DIR, 'ads.json');

// Default Seed Ads
const DEFAULT_ADS = [
  {
    id: 'ad-101',
    _id: 'ad-101',
    title: 'PRINCE STUDIOS VIP Platinum Membership',
    description: 'Exclusive VIP Membership Pass for Prince Studios',
    advertiser: 'PRINCE STUDIOS',
    adType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    video_url: '',
    targetUrl: 'https://prince-studios.com/vip',
    redirect_url: 'https://prince-studios.com/vip',
    ctaText: 'Get VIP Pass',
    placement: ['preshow', 'intermission', 'banner', 'popup'],
    priority: 10,
    status: 'active',
    isActive: true,
    impressions: 482,
    clicks: 124,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ad-102',
    _id: 'ad-102',
    title: 'Dolby Atmos 3D Spatial Audio Showcase',
    description: 'Experience true 3D spatial audio powered by Dolby Atmos',
    advertiser: 'Dolby Labs',
    adType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    image_url: '',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    targetUrl: 'https://dolby.com',
    redirect_url: 'https://dolby.com',
    ctaText: 'Discover Sound',
    placement: ['preshow', 'intermission'],
    priority: 8,
    status: 'active',
    isActive: true,
    impressions: 310,
    clicks: 68,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ad-103',
    _id: 'ad-103',
    title: 'Neo-Tokyo VR Cinema Headset 8K',
    description: 'Next gen 8K VR cinema headset',
    advertiser: 'CyberTech Labs',
    adType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop',
    image_url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop',
    video_url: '',
    targetUrl: 'https://cybertech.example.com',
    redirect_url: 'https://cybertech.example.com',
    ctaText: '25% Off Gear',
    placement: ['banner', 'popup', 'sidebar'],
    priority: 9,
    status: 'active',
    isActive: true,
    impressions: 215,
    clicks: 43,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read ads array from ads.json
function readAdsFile() {
  ensureDataDir();
  if (!fs.existsSync(ADS_FILE)) {
    writeAdsFile(DEFAULT_ADS);
    return DEFAULT_ADS;
  }
  try {
    const raw = fs.readFileSync(ADS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      writeAdsFile(DEFAULT_ADS);
      return DEFAULT_ADS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading ads.json:', err.message);
    return DEFAULT_ADS;
  }
}

// Write ads array to ads.json
function writeAdsFile(adsData) {
  ensureDataDir();
  try {
    fs.writeFileSync(ADS_FILE, JSON.stringify(adsData, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing ads.json:', err.message);
    return false;
  }
}

function formatAd(ad) {
  if (!ad) return null;
  const idStr = String(ad.id || ad._id);
  const placementArr = Array.isArray(ad.placement)
    ? ad.placement
    : (typeof ad.placement === 'string' ? ad.placement.split(',').map(s => s.trim()) : ['banner']);

  const isActive = ad.isActive !== undefined ? ad.isActive : (ad.status === 'active');
  const mediaUrl = ad.mediaUrl || ad.image_url || ad.video_url || '';

  return {
    ...ad,
    id: idStr,
    _id: idStr,
    mediaUrl,
    image_url: ad.image_url || mediaUrl,
    video_url: ad.video_url || '',
    targetUrl: ad.targetUrl || ad.redirect_url || '',
    redirect_url: ad.redirect_url || ad.targetUrl || '',
    placement: placementArr,
    isActive,
    status: isActive ? 'active' : 'inactive'
  };
}

class AdStore {
  static async getAll(filter = {}) {
    const ads = readAdsFile();
    let result = ads.map(formatAd);

    if (filter.placement) {
      result = result.filter(ad => ad.placement.includes(filter.placement));
    }
    if (filter.adType) {
      result = result.filter(ad => ad.adType === filter.adType);
    }
    if (filter.isActive !== undefined) {
      const activeState = filter.isActive === true || filter.isActive === 'true';
      result = result.filter(ad => ad.isActive === activeState);
    }
    if (filter.status) {
      result = result.filter(ad => ad.status === filter.status);
    }

    return result.sort((a, b) => b.priority - a.priority);
  }

  static async getById(id) {
    const ads = readAdsFile();
    const found = ads.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    return found ? formatAd(found) : null;
  }

  static async getRandomByPlacement(placement, adType = null) {
    const ads = await this.getAll({ placement, isActive: true });
    let eligible = ads;
    if (adType) {
      eligible = ads.filter(a => a.adType === adType);
    }
    if (eligible.length === 0) return null;

    const totalWeight = eligible.reduce((acc, ad) => acc + (Number(ad.priority) || 1), 0);
    let rand = Math.random() * totalWeight;

    for (const ad of eligible) {
      if (rand < (Number(ad.priority) || 1)) return ad;
      rand -= (Number(ad.priority) || 1);
    }
    return eligible[0];
  }

  static async create(data) {
    const ads = readAdsFile();
    const newId = `ad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isVideo = data.adType === 'video' || (data.mediaUrl && data.mediaUrl.match(/\.(mp4|webm|ogg)$/i));

    const newAd = {
      id: newId,
      _id: newId,
      title: data.title,
      description: data.description || data.advertiser || '',
      advertiser: data.advertiser || 'Prince Sponsor',
      adType: data.adType || (isVideo ? 'video' : 'image'),
      mediaUrl: data.mediaUrl || data.image_url || data.video_url || '',
      htmlContent: data.htmlContent || '',
      image_url: data.image_url || (isVideo ? '' : data.mediaUrl || ''),
      video_url: data.video_url || (isVideo ? data.mediaUrl || '' : ''),
      targetUrl: data.targetUrl || data.redirect_url || 'https://prince-studios.com',
      redirect_url: data.redirect_url || data.targetUrl || 'https://prince-studios.com',
      ctaText: data.ctaText || 'Learn More',
      placement: Array.isArray(data.placement) ? data.placement : [data.placement || 'banner'],
      priority: Number(data.priority) || 5,
      status: (data.isActive !== false && data.status !== 'inactive') ? 'active' : 'inactive',
      isActive: data.isActive !== undefined ? data.isActive : true,
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ads.unshift(newAd);
    writeAdsFile(ads);
    return formatAd(newAd);
  }

  static async update(id, updates) {
    const ads = readAdsFile();
    const idx = ads.findIndex(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (idx === -1) return null;

    const existing = ads[idx];
    const isVideo = updates.adType === 'video' || existing.adType === 'video';

    const updatedAd = {
      ...existing,
      ...updates,
      title: updates.title !== undefined ? updates.title : existing.title,
      description: updates.description !== undefined ? updates.description : existing.description,
      advertiser: updates.advertiser !== undefined ? updates.advertiser : existing.advertiser,
      mediaUrl: updates.mediaUrl !== undefined ? updates.mediaUrl : existing.mediaUrl,
      htmlContent: updates.htmlContent !== undefined ? updates.htmlContent : existing.htmlContent,
      targetUrl: updates.targetUrl !== undefined ? updates.targetUrl : existing.targetUrl,
      redirect_url: updates.redirect_url !== undefined ? updates.redirect_url : (updates.targetUrl || existing.redirect_url),
      ctaText: updates.ctaText !== undefined ? updates.ctaText : existing.ctaText,
      placement: Array.isArray(updates.placement) ? updates.placement : existing.placement,
      priority: updates.priority !== undefined ? Number(updates.priority) : existing.priority,
      status: updates.status !== undefined ? updates.status : (updates.isActive !== undefined ? (updates.isActive ? 'active' : 'inactive') : existing.status),
      isActive: updates.isActive !== undefined ? updates.isActive : existing.isActive,
      updatedAt: new Date().toISOString()
    };

    ads[idx] = updatedAd;
    writeAdsFile(ads);
    return formatAd(updatedAd);
  }

  static async delete(id) {
    let ads = readAdsFile();
    const initialLen = ads.length;
    ads = ads.filter(a => String(a.id) !== String(id) && String(a._id) !== String(id));
    if (ads.length !== initialLen) {
      writeAdsFile(ads);
      return true;
    }
    return false;
  }

  static async recordImpression(id) {
    const ads = readAdsFile();
    const ad = ads.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      writeAdsFile(ads);
      return formatAd(ad);
    }
    return null;
  }

  static async recordClick(id) {
    const ads = readAdsFile();
    const ad = ads.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      writeAdsFile(ads);
      return formatAd(ad);
    }
    return null;
  }
}

module.AdStore = AdStore;
module.exports = AdStore;
