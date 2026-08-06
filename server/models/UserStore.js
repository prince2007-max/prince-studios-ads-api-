const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Helper to ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
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
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading admin.json:', err.message);
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
    console.error('Error writing admin.json:', err.message);
    return false;
  }
}

class UserStore {
  // Ensure default admin (PRINCE / VSICS2024) is saved in admin.json with bcrypt hash
  static async ensureDefaultAdmin() {
    const adminUsername = (process.env.ADMIN_USERNAME || 'PRINCE').trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'VSICS2024';

    let currentAdmin = readAdminFile();

    if (!currentAdmin || currentAdmin.username.toLowerCase() !== adminUsername.toLowerCase()) {
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
      console.log(`🔐 Admin user saved to admin.json: ${adminUsername} (Bcrypt hashed)`);
    } else {
      const currentHash = currentAdmin.password_hash || currentAdmin.password;
      const isValid = bcrypt.compareSync(adminPassword, currentHash);

      if (!isValid) {
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(adminPassword, salt);
        currentAdmin.password_hash = newHash;
        currentAdmin.password = newHash;
        writeAdminFile(currentAdmin);
        console.log(`🔐 Admin password in admin.json updated to match environment configuration.`);
      }
    }
    return currentAdmin;
  }

  static async findByUsername(username) {
    if (!username) return null;
    const cleanUsername = username.trim().toLowerCase();
    const admin = readAdminFile();

    if (admin && admin.username.toLowerCase() === cleanUsername) {
      return admin;
    }
    return null;
  }

  static async findById(id) {
    if (!id) return null;
    const admin = readAdminFile();
    if (admin && (admin.id === id || admin._id === id)) {
      return admin;
    }
    return null;
  }

  static async updatePassword(id, hashedPassword) {
    const admin = readAdminFile();
    if (admin && (admin.id === id || admin._id === id)) {
      admin.password_hash = hashedPassword;
      admin.password = hashedPassword;
      writeAdminFile(admin);
      return admin;
    }
    return null;
  }

  static verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

module.exports = UserStore;
