const jwt = require('jsonwebtoken');
const ApiKeyStore = require('../models/ApiKeyStore');

const getJwtSecret = () => process.env.JWT_SECRET || 'prince_ads_super_secret_jwt_key_2026_production_secure_8f9a2b';

// Verify Admin JWT Token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
};

// Optional API Key or Auth middleware for public endpoints
const optionalApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (apiKey) {
    req.hasValidApiKey = await ApiKeyStore.validateKey(apiKey);
  }
  next();
};

module.exports = { authenticateJWT, optionalApiKey, getJwtSecret };

