require('dotenv').config({ path: '../.env' });
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/modern_todo';
  
  try {
    await mongoose.connect(MONGO_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@zentasks.com' });
    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const admin = new User({
      name: 'System Admin',
      email: 'admin@zentasks.com',
      password: 'admin123', // This will be hashed by the User model's pre-save hook
      role: 'admin'
    });

    await admin.save();
    console.log('Master Admin Created Successfully!');
    console.log('Email: admin@zentasks.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
