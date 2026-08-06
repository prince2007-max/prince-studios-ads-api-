const { query, getIsPgConnected } = require('../config/db');

// In-Memory Seed Storage
let memoryApiKeys = [
  {
    id: 'key-1',
    _id: 'key-1',
    name: 'Prince Studios Cinema Integration',
    key: 'pa_live_prince_cinema_98f24a12',
    domain: 'localhost',
    isActive: true,
    is_active: true,
    requests: 1420,
    created_at: new Date().toISOString()
  },
  {
    id: 'key-2',
    _id: 'key-2',
    name: 'Mobile App Ad Feed',
    key: 'pa_live_mobile_app_77b319e0',
    domain: '*',
    isActive: true,
    is_active: true,
    requests: 680,
    created_at: new Date().toISOString()
  }
];

function formatKeyRow(row) {
  if (!row) return null;
  const isActive = row.is_active !== undefined ? row.is_active : row.isActive !== false;
  return {
    ...row,
    id: String(row.id),
    _id: String(row.id),
    isActive,
    is_active: isActive
  };
}

class ApiKeyStore {
  static async getAll() {
    if (getIsPgConnected()) {
      const res = await query('SELECT * FROM api_keys ORDER BY created_at DESC;');
      return res ? res.rows.map(formatKeyRow) : [];
    }
    return memoryApiKeys.map(formatKeyRow);
  }

  static async validateKey(key) {
    if (!key) return false;

    if (getIsPgConnected()) {
      const res = await query(
        'UPDATE api_keys SET requests = requests + 1 WHERE key = $1 AND is_active = true RETURNING *;',
        [key]
      );
      return res && res.rows.length > 0;
    }

    const found = memoryApiKeys.find(k => k.key === key && k.isActive);
    if (found) {
      found.requests += 1;
      return true;
    }
    return false;
  }

  static async create(name, domain = '*') {
    const keyName = name || 'External Application';
    const keyString = `pa_live_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;

    if (getIsPgConnected()) {
      const res = await query(
        'INSERT INTO api_keys (name, key, domain, is_active, requests) VALUES ($1, $2, $3, true, 0) RETURNING *;',
        [keyName, keyString, domain]
      );
      return res ? formatKeyRow(res.rows[0]) : null;
    }

    const newKey = {
      id: `key-${Date.now()}`,
      _id: `key-${Date.now()}`,
      name: keyName,
      key: keyString,
      domain,
      isActive: true,
      is_active: true,
      requests: 0,
      created_at: new Date().toISOString()
    };

    memoryApiKeys.unshift(newKey);
    return formatKeyRow(newKey);
  }

  static async delete(id) {
    if (getIsPgConnected()) {
      const res = await query('DELETE FROM api_keys WHERE id = $1 RETURNING *;', [id]);
      return res && res.rows.length > 0;
    }

    const initialLen = memoryApiKeys.length;
    memoryApiKeys = memoryApiKeys.filter(k => String(k.id) !== String(id) && String(k._id) !== String(id));
    return memoryApiKeys.length !== initialLen;
  }
}

module.exports = ApiKeyStore;
