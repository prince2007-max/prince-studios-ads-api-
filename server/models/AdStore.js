const { query, getIsPgConnected } = require('../config/db');

// In-Memory Seed Storage
let memoryAds = [
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
    redirect_url: 'https://prince-studios.com/vip',
    targetUrl: 'https://prince-studios.com/vip',
    ctaText: 'Get VIP Pass',
    placement: ['preshow', 'intermission', 'banner', 'popup'],
    priority: 10,
    status: 'active',
    isActive: true,
    impressions: 482,
    clicks: 124,
    created_at: new Date(),
    updated_at: new Date()
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
    redirect_url: 'https://dolby.com',
    targetUrl: 'https://dolby.com',
    ctaText: 'Discover Sound',
    placement: ['preshow', 'intermission'],
    priority: 8,
    status: 'active',
    isActive: true,
    impressions: 310,
    clicks: 68,
    created_at: new Date(),
    updated_at: new Date()
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
    redirect_url: 'https://cybertech.example.com',
    targetUrl: 'https://cybertech.example.com',
    ctaText: '25% Off Gear',
    placement: ['banner', 'popup', 'sidebar'],
    priority: 9,
    status: 'active',
    isActive: true,
    impressions: 215,
    clicks: 43,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Helper to normalize ad DB row for frontend compatibility
function formatAdRow(row) {
  if (!row) return null;
  const placementArr = typeof row.placement === 'string'
    ? row.placement.split(',').map(s => s.trim())
    : (Array.isArray(row.placement) ? row.placement : ['banner']);

  const isActive = row.status === 'active' || row.status === 'true' || row.is_active === true || row.isActive === true;
  const mediaUrl = row.image_url || row.video_url || row.media_url || row.mediaUrl || '';
  const adType = row.video_url || row.adType === 'video' ? 'video' : (row.html_content || row.htmlContent ? 'html' : 'image');

  return {
    ...row,
    _id: String(row.id),
    id: String(row.id),
    mediaUrl: mediaUrl,
    image_url: row.image_url || mediaUrl,
    video_url: row.video_url || '',
    targetUrl: row.redirect_url || row.target_url || row.targetUrl || '',
    redirect_url: row.redirect_url || row.target_url || row.targetUrl || '',
    placement: placementArr,
    isActive: isActive,
    status: isActive ? 'active' : 'inactive',
    adType: adType
  };
}

class AdStore {
  // Query all ads (supports filtering for public vs admin view)
  static async getAll(filter = {}) {
    if (getIsPgConnected()) {
      let sql = 'SELECT * FROM ads WHERE 1=1';
      const params = [];

      if (filter.isActive !== undefined || filter.status) {
        params.push(filter.status || (filter.isActive ? 'active' : 'inactive'));
        sql += ` AND status = $${params.length}`;
      }

      if (filter.placement) {
        params.push(`%${filter.placement}%`);
        sql += ` AND placement LIKE $${params.length}`;
      }

      sql += ' ORDER BY priority DESC, created_at DESC;';
      const res = await query(sql, params);
      return res ? res.rows.map(formatAdRow) : [];
    }

    let result = memoryAds.map(formatAdRow);
    if (filter.placement) {
      result = result.filter(ad => ad.placement.includes(filter.placement));
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

  // Get single ad by ID
  static async getById(id) {
    if (getIsPgConnected()) {
      const res = await query('SELECT * FROM ads WHERE id = $1 LIMIT 1;', [id]);
      return res && res.rows.length > 0 ? formatAdRow(res.rows[0]) : null;
    }
    const found = memoryAds.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    return found ? formatAdRow(found) : null;
  }

  // Weighted selection by placement for ad serving
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

  // Parameterized SQL INSERT
  static async create(data) {
    const title = data.title;
    const description = data.description || data.advertiser || '';
    const isVideo = data.adType === 'video' || (data.mediaUrl && data.mediaUrl.match(/\.(mp4|webm|ogg)$/i));
    const imageUrl = isVideo ? '' : (data.mediaUrl || data.image_url || '');
    const videoUrl = isVideo ? (data.mediaUrl || data.video_url || '') : '';
    const redirectUrl = data.targetUrl || data.redirect_url || 'https://prince-studios.com';
    const placement = Array.isArray(data.placement) ? data.placement.join(',') : (data.placement || 'banner');
    const status = (data.isActive !== false && data.status !== 'inactive') ? 'active' : 'inactive';
    const priority = Number(data.priority) || 5;

    if (getIsPgConnected()) {
      const sql = `
        INSERT INTO ads (title, description, image_url, video_url, redirect_url, placement, status, priority, impressions, clicks)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0)
        RETURNING *;
      `;
      const res = await query(sql, [title, description, imageUrl, videoUrl, redirectUrl, placement, status, priority]);
      return res ? formatAdRow(res.rows[0]) : null;
    }

    const newId = `ad-${Date.now()}`;
    const newAd = {
      id: newId,
      _id: newId,
      title,
      description,
      advertiser: data.advertiser || 'Prince Sponsor',
      adType: data.adType || (isVideo ? 'video' : 'image'),
      mediaUrl: data.mediaUrl || imageUrl || videoUrl,
      image_url: imageUrl,
      video_url: videoUrl,
      targetUrl: redirectUrl,
      redirect_url: redirectUrl,
      ctaText: data.ctaText || 'Learn More',
      placement: Array.isArray(data.placement) ? data.placement : [placement],
      priority,
      status,
      isActive: status === 'active',
      impressions: 0,
      clicks: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryAds.unshift(newAd);
    return formatAdRow(newAd);
  }

  // Parameterized SQL UPDATE
  static async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title : existing.title;
    const description = updates.description !== undefined ? updates.description : (updates.advertiser || existing.description);
    const imageUrl = updates.image_url !== undefined ? updates.image_url : (updates.mediaUrl || existing.image_url);
    const videoUrl = updates.video_url !== undefined ? updates.video_url : existing.video_url;
    const redirectUrl = updates.redirect_url !== undefined ? updates.redirect_url : (updates.targetUrl || existing.redirect_url);
    const placement = Array.isArray(updates.placement) ? updates.placement.join(',') : (updates.placement || existing.placement.join(','));
    const status = updates.status !== undefined ? updates.status : (updates.isActive !== undefined ? (updates.isActive ? 'active' : 'inactive') : existing.status);
    const priority = updates.priority !== undefined ? Number(updates.priority) : existing.priority;

    if (getIsPgConnected()) {
      const sql = `
        UPDATE ads
        SET title = $1, description = $2, image_url = $3, video_url = $4, redirect_url = $5, placement = $6, status = $7, priority = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *;
      `;
      const res = await query(sql, [title, description, imageUrl, videoUrl, redirectUrl, placement, status, priority, id]);
      return res && res.rows.length > 0 ? formatAdRow(res.rows[0]) : null;
    }

    const idx = memoryAds.findIndex(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (idx !== -1) {
      memoryAds[idx] = {
        ...memoryAds[idx],
        ...updates,
        title,
        description,
        image_url: imageUrl,
        video_url: videoUrl,
        redirect_url: redirectUrl,
        status,
        isActive: status === 'active',
        priority,
        updated_at: new Date()
      };
      return formatAdRow(memoryAds[idx]);
    }
    return null;
  }

  // Parameterized SQL DELETE
  static async delete(id) {
    if (getIsPgConnected()) {
      const res = await query('DELETE FROM ads WHERE id = $1 RETURNING *;', [id]);
      return res && res.rows.length > 0;
    }

    const initialLen = memoryAds.length;
    memoryAds = memoryAds.filter(a => String(a.id) === String(id) && String(a._id) === String(id));
    return memoryAds.length !== initialLen;
  }

  // Track Impression
  static async recordImpression(id) {
    if (getIsPgConnected()) {
      const res = await query('UPDATE ads SET impressions = impressions + 1 WHERE id = $1 RETURNING *;', [id]);
      return res && res.rows.length > 0 ? formatAdRow(res.rows[0]) : null;
    }

    const ad = memoryAds.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
    }
    return ad ? formatAdRow(ad) : null;
  }

  // Track Click
  static async recordClick(id) {
    if (getIsPgConnected()) {
      const res = await query('UPDATE ads SET clicks = clicks + 1 WHERE id = $1 RETURNING *;', [id]);
      return res && res.rows.length > 0 ? formatAdRow(res.rows[0]) : null;
    }

    const ad = memoryAds.find(a => String(a.id) === String(id) || String(a._id) === String(id));
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
    }
    return ad ? formatAdRow(ad) : null;
  }
}

module.exports = AdStore;
