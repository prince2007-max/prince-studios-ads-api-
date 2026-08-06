let memoryApiKeys = [
  {
    _id: 'key-1',
    name: 'Prince Studios Cinema Integration',
    key: 'pa_live_prince_cinema_98f24a12',
    domain: 'localhost',
    isActive: true,
    requests: 1420,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'key-2',
    name: 'Mobile App Ad Feed',
    key: 'pa_live_mobile_app_77b319e0',
    domain: '*',
    isActive: true,
    requests: 680,
    createdAt: new Date().toISOString()
  }
];

class ApiKeyStore {
  static async getAll() {
    return [...memoryApiKeys];
  }

  static async validateKey(key) {
    if (!key) return false;
    const found = memoryApiKeys.find(k => k.key === key && k.isActive);
    if (found) {
      found.requests += 1;
      return true;
    }
    return false;
  }

  static async create(name, domain = '*') {
    const newKey = {
      _id: `key-${Date.now()}`,
      name: name || 'External Application',
      key: `pa_live_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
      domain,
      isActive: true,
      requests: 0,
      createdAt: new Date().toISOString()
    };
    memoryApiKeys.unshift(newKey);
    return newKey;
  }

  static async revoke(id) {
    const keyItem = memoryApiKeys.find(k => k._id === id);
    if (keyItem) {
      keyItem.isActive = false;
      return true;
    }
    return false;
  }

  static async delete(id) {
    const initialLen = memoryApiKeys.length;
    memoryApiKeys = memoryApiKeys.filter(k => k._id !== id);
    return memoryApiKeys.length !== initialLen;
  }
}

module.exports = ApiKeyStore;
