const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { authenticateJWT } = require('./middleware/auth');
const UserStore = require('./models/UserStore');
const AdStore = require('./models/AdStore');

dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const prodClientUrl = process.env.CLIENT_URL;

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (browser fetching from same domain, no Origin header)
    if (!origin) return callback(null, true);

    if (isProduction) {
      // In production, allow same-origin (self-hosted React app) and configured CLIENT_URL
      if (prodClientUrl && (origin === prodClientUrl || origin.replace(/\/$/, '') === prodClientUrl.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      // Also allow same-origin for unified deployment (React served from Express)
      return callback(null, true);
    }

    // Development mode — allow all origins
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static React production build assets from client/dist
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/keys', require('./routes/apiKeyRoutes'));

// GET /api/analytics - Global performance metrics (Admin Auth Required)
app.get('/api/analytics', authenticateJWT, async (req, res) => {
  try {
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
        activeAds: ads.filter(a => a.isActive || a.status === 'active').length,
        totalImpressions,
        totalClicks,
        ctr: `${ctr}%`,
        typeBreakdown
      }
    });
  } catch (err) {
    console.error('[Analytics Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Non-API Route Handler: Return client/dist/index.html for SPA routes (/ , /login, /dashboard)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexHtml = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
  }
  res.status(404).json({ success: false, error: 'Resource or API endpoint not found.' });
});

// Initialize admin and start server
async function startServer() {
  try {
    // Await admin initialization BEFORE accepting any requests
    await UserStore.ensureDefaultAdmin();
    console.log('✅ Admin account initialized successfully.');
  } catch (err) {
    console.error('⚠️ Admin initialization error (non-fatal):', err.message);
  }

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Prince Ads Unified Express App running on port ${PORT}`);
    console.log(`📡 Base URL: http://localhost:${PORT}`);
    console.log(`🔑 API Endpoints: http://localhost:${PORT}/api/ads`);
    console.log(`💻 Serving React Dashboard from: ${clientDistPath}`);
  });
}

startServer();
