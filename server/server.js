const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const { authenticateJWT } = require('./middleware/auth');
const UserStore = require('./models/UserStore');

// Database Connection & Admin Init
connectDB().then(() => {
  UserStore.ensureDefaultAdmin();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/keys', require('./routes/apiKeyRoutes'));

// GET /api/analytics - Global performance metrics (Admin Auth Required)
app.get('/api/analytics', authenticateJWT, async (req, res) => {
  try {
    const AdStore = require('./models/AdStore');
    const ads = await AdStore.getAll();
    
    let totalImpressions = 0;
    let totalClicks = 0;
    const typeBreakdown = { image: 0, video: 0, html: 0 };

    ads.forEach(ad => {
      totalImpressions += (ad.impressions || 0);
      totalClicks += (ad.clicks || 0);
      if (typeBreakdown[ad.adType] !== undefined) {
        typeBreakdown[ad.adType] += 1;
      }
    });

    const ctr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        totalAds: ads.length,
        activeAds: ads.filter(a => a.isActive).length,
        totalImpressions,
        totalClicks,
        ctr: `${ctr}%`,
        typeBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root API Health Check
app.get('/', (req, res) => {
  res.json({
    name: 'Prince Ads - Standalone Ad Engine REST API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/ads',
    endpoints: [
      'GET /api/ads',
      'GET /api/ads/banner',
      'GET /api/ads/video',
      'GET /api/ads/placement/:placement',
      'POST /api/ads',
      'PUT /api/ads/:id',
      'DELETE /api/ads/:id',
      'POST /api/auth/login',
      'GET /api/keys'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Prince Ads REST API Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`🔑 Endpoints Ready: http://localhost:${PORT}/api/ads`);
});
