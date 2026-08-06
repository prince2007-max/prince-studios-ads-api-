const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/prince_ads';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Database successfully');
  } catch (err) {
    isMongoConnected = false;
    console.log('⚠️ MongoDB connection timeout/unavailable. Operating in Fast Fallback Memory DB Mode.');
  }
};

const getIsMongoConnected = () => isMongoConnected;

module.exports = { connectDB, getIsMongoConnected };
