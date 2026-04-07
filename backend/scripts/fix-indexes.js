require('dotenv').config({ path: '../.env' });
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const fixIndexes = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/modern_todo';
  
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    console.log('Fetching indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    if (indexes.some(i => i.name === 'username_1')) {
      console.log('Dropping rogue username_1 index...');
      await collection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index!');
    } else {
      console.log('No rogue username_1 index found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error fixing indexes:', err);
    process.exit(1);
  }
};

fixIndexes();
