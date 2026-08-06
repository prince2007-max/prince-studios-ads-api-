const bcrypt = require('bcryptjs');
const { query, getIsPgConnected } = require('../config/db');

// In-Memory Fallback Storage
let memoryAdmins = [];

class UserStore {
  // Ensure initial setup admin (PRINCE / VSICS2024) exists in database with bcrypt hash
  static async ensureDefaultAdmin() {
    const adminUsername = (process.env.ADMIN_USERNAME || 'PRINCE').trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'VSICS2024';

    const existing = await this.findByUsername(adminUsername);
    if (!existing) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(adminPassword, salt);

      await this.create({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });

      console.log(`🔐 Initial PostgreSQL Admin User verified/created: ${adminUsername} (Password hashed with bcrypt)`);
    } else {
      const currentPasswordHash = existing.password_hash || existing.password;
      const isPasswordValid = bcrypt.compareSync(adminPassword, currentPasswordHash);
      if (!isPasswordValid) {
        const salt = bcrypt.genSaltSync(10);
        const newHashedPassword = bcrypt.hashSync(adminPassword, salt);
        await this.updatePassword(existing.id || existing._id, newHashedPassword);
        console.log(`🔐 PostgreSQL Admin password updated to match environment config.`);
      }
    }
  }

  // Parameterized SQL search for user by username
  static async findByUsername(username) {
    if (!username) return null;
    const cleanUsername = username.trim().toLowerCase();

    if (getIsPgConnected()) {
      const res = await query('SELECT * FROM admins WHERE LOWER(username) = LOWER($1) LIMIT 1;', [cleanUsername]);
      return res && res.rows.length > 0 ? res.rows[0] : null;
    }

    return memoryAdmins.find(u => u.username.toLowerCase() === cleanUsername) || null;
  }

  // Parameterized SQL search by ID
  static async findById(id) {
    if (!id) return null;

    if (getIsPgConnected()) {
      const res = await query('SELECT * FROM admins WHERE id = $1 LIMIT 1;', [id]);
      return res && res.rows.length > 0 ? res.rows[0] : null;
    }

    return memoryAdmins.find(u => u.id === id || u._id === id) || null;
  }

  // Parameterized SQL INSERT into admins table
  static async create(userData) {
    const cleanUsername = userData.username.trim().toLowerCase();
    const passwordHash = userData.password_hash || userData.password;
    const role = userData.role || 'admin';

    if (getIsPgConnected()) {
      const res = await query(
        'INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *;',
        [cleanUsername, passwordHash, role]
      );
      return res.rows[0];
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      username: cleanUsername,
      password_hash: passwordHash,
      password: passwordHash,
      role,
      created_at: new Date()
    };

    memoryAdmins.push(newAdmin);
    return newAdmin;
  }

  // Parameterized SQL UPDATE for password_hash
  static async updatePassword(id, hashedPassword) {
    if (getIsPgConnected()) {
      const res = await query(
        'UPDATE admins SET password_hash = $1 WHERE id = $2 RETURNING *;',
        [hashedPassword, id]
      );
      return res && res.rows.length > 0 ? res.rows[0] : null;
    }

    const admin = memoryAdmins.find(u => u.id === id || u._id === id);
    if (admin) {
      admin.password_hash = hashedPassword;
      admin.password = hashedPassword;
    }
    return admin;
  }

  // Verify bcrypt password
  static verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

module.exports = UserStore;
