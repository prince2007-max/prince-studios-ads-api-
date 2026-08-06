const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Helper to ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[UserStore] Cannot create data directory:', err.message);
  }
}

// Read admin account from JSON file
function readAdminFile() {
  ensureDataDir();
  if (!fs.existsSync(ADMIN_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(ADMIN_FILE, 'utf8');
    if (!raw || raw.trim().length === 0) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('[UserStore] Error reading admin.json:', err.message);
    return null;
  }
}

// Write admin account to JSON file
function writeAdminFile(adminData) {
  ensureDataDir();
  try {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[UserStore] Error writing admin.json:', err.message);
    return false;
  }
}

class UserStore {
  // Ensure default admin (PRINCE / VSICS2024) is saved in admin.json with bcrypt hash
  static async ensureDefaultAdmin() {
    try {
      const adminUsername = (process.env.ADMIN_USERNAME || 'PRINCE').trim();
      const adminPassword = process.env.ADMIN_PASSWORD || 'VSICS2024';

      let currentAdmin = readAdminFile();

      if (!currentAdmin || !currentAdmin.username || currentAdmin.username.toLowerCase() !== adminUsername.toLowerCase()) {
        // Create new admin or overwrite if username mismatch
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(adminPassword, salt);

        currentAdmin = {
          id: 'admin-1',
          username: adminUsername.toLowerCase(),
          password_hash: hashedPassword,
          password: hashedPassword,
          name: 'Prince Ads Admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        };

        writeAdminFile(currentAdmin);
        console.log(`🔐 Admin user created in admin.json: ${adminUsername} (Bcrypt hashed)`);
      } else {
        // Admin exists — verify password hash matches the current env password
        const currentHash = currentAdmin.password_hash || currentAdmin.password;
        if (currentHash) {
          const isValid = bcrypt.compareSync(adminPassword, currentHash);
          if (!isValid) {
            const salt = bcrypt.genSaltSync(10);
            const newHash = bcrypt.hashSync(adminPassword, salt);
            currentAdmin.password_hash = newHash;
            currentAdmin.password = newHash;
            writeAdminFile(currentAdmin);
            console.log(`🔐 Admin password updated in admin.json to match environment.`);
          }
        } else {
          // Hash is missing — regenerate
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(adminPassword, salt);
          currentAdmin.password_hash = hashedPassword;
          currentAdmin.password = hashedPassword;
          writeAdminFile(currentAdmin);
          console.log(`🔐 Admin password hash regenerated in admin.json.`);
        }
      }
      return currentAdmin;
    } catch (err) {
      console.error('[UserStore] ensureDefaultAdmin error:', err.message);
      throw err;
    }
  }

  static async findByUsername(username) {
    if (!username) return null;
    try {
      const cleanUsername = username.trim().toLowerCase();
      const admin = readAdminFile();

      if (admin && admin.username && admin.username.toLowerCase() === cleanUsername) {
        return admin;
      }
      return null;
    } catch (err) {
      console.error('[UserStore] findByUsername error:', err.message);
      return null;
    }
  }

  static async findById(id) {
    if (!id) return null;
    try {
      const admin = readAdminFile();
      if (admin && (admin.id === id || admin._id === id)) {
        return admin;
      }
      return null;
    } catch (err) {
      console.error('[UserStore] findById error:', err.message);
      return null;
    }
  }

  static async updatePassword(id, hashedPassword) {
    try {
      const admin = readAdminFile();
      if (admin && (admin.id === id || admin._id === id)) {
        admin.password_hash = hashedPassword;
        admin.password = hashedPassword;
        writeAdminFile(admin);
        return admin;
      }
      return null;
    } catch (err) {
      console.error('[UserStore] updatePassword error:', err.message);
      return null;
    }
  }

  static verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    try {
      return bcrypt.compareSync(plainPassword, hashedPassword);
    } catch (err) {
      console.error('[UserStore] verifyPassword error:', err.message);
      return false;
    }
  }
}

module.exports = UserStore;
