require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node promote-admin.js <email>');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/modern_todo';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`Successfully promoted ${email} to admin!`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
