const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserStore = require('../models/UserStore');
const { getJwtSecret } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    // Ensure default admin exists (safe to call multiple times)
    try {
      await UserStore.ensureDefaultAdmin();
    } catch (initErr) {
      console.error('[Login] Admin init error:', initErr.message);
      // Continue anyway — admin may already exist from server startup
    }

    const user = await UserStore.findByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Verify bcrypt password hash — use password_hash field, fall back to password field
    const storedHash = user.password_hash || user.password;
    if (!storedHash) {
      console.error('[Login] No password hash found for user:', user.username);
      return res.status(500).json({ success: false, error: 'Account configuration error. Please contact administrator.' });
    }

    const isValid = UserStore.verifyPassword(password, storedHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        id: user._id || user.id,
        username: user.username,
        name: user.name || 'Admin User',
        role: user.role || 'admin'
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        name: user.name || 'Admin User',
        role: user.role || 'admin'
      }
    });
  } catch (err) {
    console.error('[Login Error]', err.message, err.stack);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin privileges required.' });
    }

    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid token.' });
  }
});

module.exports = router;
