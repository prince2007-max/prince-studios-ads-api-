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

// CORS configuration
// In a unified app (Express serves React), all browser requests are same-origin.
// We allow all same-origin requests and optionally allow CLIENT_URL if set.
app.use(cors({
  origin: (origin, callback) => {
    // Same-origin requests have no Origin header — always allow
    if (!origin) return callback(null, true);

    // In production, allow same-origin (the Render domain) and CLIENT_URL if set
    if (isProduction) {
      const clientUrl = process.env.CLIENT_URL;
      // Allow if CLIENT_URL matches, or if CLIENT_URL is not set (unified app = same-origin is fine)
      if (!clientUrl) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedClient = clientUrl.replace(/\/$/, '');
      if (normalizedOrigin === normalizedClient) {
        return callback(null, true);
      }
      return callback(new Error('CORS Policy: Origin not allowed.'));
    }

    // Development: allow everything
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Resolve client/dist path relative to server directory
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');

// Serve static React production build assets from client/dist
// This must come BEFORE the wildcard SPA fallback route
if (fs.existsSync(clientDistPath)) {
  console.log(`📂 Serving static files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
} else {
  console.warn(`⚠️  WARNING: client/dist not found at ${clientDistPath}. Run 'npm run build' first.`);
}

// Auto-initialize local JSON database stores & default admin user
UserStore.ensureDefaultAdmin();

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
    res.status(500).json({ success: false, error: err.message });
  }
});

// SPA Fallback: For any non-API GET request, serve index.html
// This lets React Router handle /login, /dashboard, etc.
app.get('*', (req, res) => {
  // Never intercept /api/* routes — let them 404 naturally
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found.' });
  }

  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  res.status(500).json({ success: false, error: 'Client build not found. Run npm run build.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Prince Ads Unified App running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`🔑 API Endpoints: http://localhost:${PORT}/api/ads`);
  console.log(`💻 Client dist path: ${clientDistPath}`);
  console.log(`📦 Client dist exists: ${fs.existsSync(clientDistPath)}`);
});
