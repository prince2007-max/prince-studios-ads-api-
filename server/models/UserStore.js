const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getIsMongoConnected } = require('../config/db');

// User Mongoose Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Admin User' },
  role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', UserSchema);

// In-Memory Fallback Storage
let memoryUsers = [];

class UserStore {
  // Ensure initial setup admin exists with bcrypt hashed password
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
        name: 'Prince Ads Admin',
        role: 'admin'
      });

      console.log(`🔐 Initial Admin User created: ${adminUsername} (Password hashed with bcrypt)`);
    } else {
      // Ensure existing admin user's password is updated if changed in env
      const isPasswordValid = bcrypt.compareSync(adminPassword, existing.password);
      if (!isPasswordValid) {
        const salt = bcrypt.genSaltSync(10);
        const newHashedPassword = bcrypt.hashSync(adminPassword, salt);
        await this.updatePassword(existing._id || existing.id, newHashedPassword);
        console.log(`🔐 Admin password updated to match environment config.`);
      }
    }
  }

  static async findByUsername(username) {
    if (!username) return null;
    const lowerUsername = username.trim().toLowerCase();

    if (getIsMongoConnected()) {
      return await UserModel.findOne({ username: lowerUsername });
    }

    return memoryUsers.find(u => u.username.toLowerCase() === lowerUsername) || null;
  }

  static async findById(id) {
    if (getIsMongoConnected()) {
      return await UserModel.findById(id);
    }
    return memoryUsers.find(u => u._id === id || u.id === id) || null;
  }

  static async create(userData) {
    const lowerUsername = userData.username.trim().toLowerCase();

    if (getIsMongoConnected()) {
      const newUser = new UserModel({ ...userData, username: lowerUsername });
      return await newUser.save();
    }

    const newUser = {
      _id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: lowerUsername,
      password: userData.password,
      name: userData.name || 'Admin User',
      role: userData.role || 'admin',
      createdAt: new Date()
    };

    memoryUsers.push(newUser);
    return newUser;
  }

  static async updatePassword(id, hashedPassword) {
    if (getIsMongoConnected()) {
      return await UserModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    }

    const user = memoryUsers.find(u => u._id === id || u.id === id);
    if (user) {
      user.password = hashedPassword;
    }
    return user;
  }

  static verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

module.exports = UserStore;
