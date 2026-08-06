const { Pool } = require('pg');

let pool = null;
let isPgConnected = false;

const connectionString = process.env.DATABASE_URL;

// Configure PostgreSQL Pool with Render SSL support
if (connectionString) {
  const isRender = connectionString.includes('render.com') || process.env.NODE_ENV === 'production';
  pool = new Pool({
    connectionString,
    ssl: isRender ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });
}

// Parameterized SQL query helper
const query = async (text, params) => {
  if (isPgConnected && pool) {
    return await pool.query(text, params);
  }
  return null;
};

const getIsPgConnected = () => isPgConnected;

// Initialize Database Tables
const initDB = async () => {
  if (!pool) {
    console.log('ℹ️ DATABASE_URL not present or invalid. Operating with fast isolated in-memory storage mode.');
    isPgConnected = false;
    return;
  }

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL Database successfully');
    isPgConnected = true;

    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create ads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        video_url TEXT DEFAULT '',
        redirect_url TEXT DEFAULT '',
        placement VARCHAR(255) DEFAULT 'banner',
        status VARCHAR(50) DEFAULT 'active',
        priority INTEGER DEFAULT 5,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create api_keys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        key VARCHAR(255) UNIQUE NOT NULL,
        domain VARCHAR(255) DEFAULT '*',
        is_active BOOLEAN DEFAULT TRUE,
        requests INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('⚡ PostgreSQL database tables verified/created successfully.');
  } catch (err) {
    isPgConnected = false;
    console.log('⚠️ PostgreSQL DB connection uninitialized/unavailable:', err.message);
    console.log('👉 Operating in fast in-memory storage fallback mode.');
  }
};

module.exports = { pool, query, initDB, getIsPgConnected };
