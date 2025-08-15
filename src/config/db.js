const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: 'crowdshield' });
  console.log('MongoDB connected');
}

module.exports = { connectDb };
