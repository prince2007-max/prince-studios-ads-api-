const express = require('express');
const router = express.Router();
const ApiKeyStore = require('../models/ApiKeyStore');
const { authenticateJWT } = require('../middleware/auth');

// GET /api/keys - List API Keys (Auth required)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const keys = await ApiKeyStore.getAll();
    res.json({ success: true, count: keys.length, data: keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/keys - Create API Key
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, domain } = req.body;
    const created = await ApiKeyStore.create(name, domain);
    res.status(201).json({ success: true, message: 'API Key generated', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/keys/:id - Delete / Revoke Key
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const deleted = await ApiKeyStore.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }
    res.json({ success: true, message: 'API Key revoked and deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
