const express = require('express');
const router = express.Router();
const AdStore = require('../models/AdStore');
const { authenticateJWT, optionalApiKey } = require('../middleware/auth');

// GET /api/ads - List all active or filtered ads
router.get('/', optionalApiKey, async (req, res) => {
  try {
    const { placement, adType, isActive } = req.query;
    const filter = {};
    if (placement) filter.placement = placement;
    if (adType) filter.adType = adType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const ads = await AdStore.getAll(filter);
    res.json({ success: true, count: ads.length, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ads/banner - Fetch random/priority banner ad
router.get('/banner', optionalApiKey, async (req, res) => {
  try {
    const ad = await AdStore.getRandomByPlacement('banner');
    if (!ad) {
      return res.status(444).json({ success: false, message: 'No active banner ad found' });
    }
    await AdStore.recordImpression(ad._id || ad.id);
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ads/video - Fetch random/priority video ad
router.get('/video', optionalApiKey, async (req, res) => {
  try {
    const ad = await AdStore.getRandomByPlacement('preshow', 'video') || await AdStore.getRandomByPlacement('intermission', 'video');
    if (!ad) {
      // Fall back to any active ad
      const fallbackAd = await AdStore.getRandomByPlacement('banner');
      if (!fallbackAd) {
        return res.status(404).json({ success: false, message: 'No active video ad found' });
      }
      await AdStore.recordImpression(fallbackAd._id || fallbackAd.id);
      return res.json({ success: true, data: fallbackAd });
    }
    await AdStore.recordImpression(ad._id || ad.id);
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ads/placement/:placement - Fetch ad by specific placement (preshow, intermission, popup, banner, sidebar)
router.get('/placement/:placement', optionalApiKey, async (req, res) => {
  try {
    const placement = req.params.placement;
    const ad = await AdStore.getRandomByPlacement(placement);
    if (!ad) {
      return res.status(404).json({ success: false, message: `No active ad found for placement '${placement}'` });
    }
    await AdStore.recordImpression(ad._id || ad.id);
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ads/:id - Fetch single ad by ID
router.get('/:id', async (req, res) => {
  try {
    const ad = await AdStore.getById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ads/upload - Upload ad image/video media (Auth protected)
router.post('/upload', authenticateJWT, async (req, res) => {
  try {
    const { fileData, fileName, fileType } = req.body;

    if (!fileData) {
      return res.status(400).json({ success: false, error: 'File data is required for upload' });
    }

    // In a production setup, this would write to cloud storage (S3/Cloudinary) or filesystem.
    // Return data URL / media URL directly to frontend.
    return res.json({
      success: true,
      message: 'Media uploaded successfully',
      mediaUrl: fileData,
      fileName: fileName || 'uploaded_media',
      fileType: fileType || 'image'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ads - Create a new ad (Auth protected or API Key)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, advertiser, adType, mediaUrl, htmlContent, targetUrl, ctaText, placement, priority, startDate, endDate, targetPages, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    if (adType === 'html' && !htmlContent) {
      return res.status(400).json({ success: false, error: 'HTML Content is required for HTML ads' });
    }

    if (adType !== 'html' && !mediaUrl) {
      return res.status(400).json({ success: false, error: 'Media URL is required for Image/Video ads' });
    }

    const created = await AdStore.create({
      title,
      advertiser,
      adType,
      mediaUrl,
      htmlContent,
      targetUrl,
      ctaText,
      placement: Array.isArray(placement) ? placement : [placement || 'banner'],
      priority: Number(priority) || 5,
      startDate,
      endDate,
      targetPages: Array.isArray(targetPages) ? targetPages : (targetPages ? [targetPages] : []),
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, message: 'Ad created successfully', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/ads/:id - Update ad details
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const updated = await AdStore.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }
    res.json({ success: true, message: 'Ad updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/ads/:id - Delete an ad
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const deleted = await AdStore.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Ad not found or already deleted' });
    }
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ads/impression/:id - Track ad impression
router.post('/impression/:id', async (req, res) => {
  try {
    const ad = await AdStore.recordImpression(req.params.id);
    res.json({ success: true, message: 'Impression recorded', impressions: ad ? ad.impressions : 0 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ads/click/:id - Track ad click
router.post('/click/:id', async (req, res) => {
  try {
    const ad = await AdStore.recordClick(req.params.id);
    res.json({ success: true, message: 'Click recorded', clicks: ad ? ad.clicks : 0 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
