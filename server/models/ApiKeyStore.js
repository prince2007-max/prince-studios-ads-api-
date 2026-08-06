const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');

const DEFAULT_KEYS = [
  {
    id: 'key-1',
    _id: 'key-1',
    name: 'Prince Studios Cinema Integration',
    key: 'pa_live_prince_cinema_98f24a12',
    domain: 'localhost',
    isActive: true,
    requests: 1420,
    createdAt: new Date().toISOString()
  },
  {
    id: 'key-2',
    _id: 'key-2',
    name: 'Mobile App Ad Feed',
    key: 'pa_live_mobile_app_77b319e0',
    domain: '*',
    isActive: true,
    requests: 680,
    createdAt: new Date().toISOString()
  }
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readKeysFile() {
  ensureDataDir();
  if (!fs.existsSync(KEYS_FILE)) {
    writeKeysFile(DEFAULT_KEYS);
    return DEFAULT_KEYS;
  }
  try {
    const raw = fs.readFileSync(KEYS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_KEYS;
    return parsed;
  } catch (err) {
    return DEFAULT_KEYS;
  }
}

function writeKeysFile(data) {
  ensureDataDir();
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

class ApiKeyStore {
  static async getAll() {
    return readKeysFile();
  }

  static async validateKey(key) {
    if (!key) return false;
    const keys = readKeysFile();
    const found = keys.find(k => k.key === key && k.isActive);
    if (found) {
      found.requests = (found.requests || 0) + 1;
      writeKeysFile(keys);
      return true;
    }
    return false;
  }

  static async create(name, domain = '*') {
    const keys = readKeysFile();
    const newId = `key-${Date.now()}`;
    const newKey = {
      id: newId,
      _id: newId,
      name: name || 'External Application',
      key: `pa_live_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
      domain,
      isActive: true,
      requests: 0,
      createdAt: new Date().toISOString()
    };
    keys.unshift(newKey);
    writeKeysFile(keys);
    return newKey;
  }

  static async delete(id) {
    let keys = readKeysFile();
    const initialLen = keys.length;
    keys = keys.filter(k => String(k.id) !== String(id) && String(k._id) !== String(id));
    if (keys.length !== initialLen) {
      writeKeysFile(keys);
      return true;
    }
    return false;
  }
}

module.exports = ApiKeyStore;
