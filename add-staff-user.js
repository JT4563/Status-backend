require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDb } = require('./src/config/db');
const User = require('./src/models/User');

(async () => {
  try {
    await connectDb();
    
    // Check if staff user already exists
    const existingStaff = await User.findOne({ email: 'staff@crowdshield.ai' });
    if (existingStaff) {
      console.log('Staff user already exists');
      process.exit(0);
    }
    
    // Create staff user
    const passwordHash = await bcrypt.hash('staff123', 10);
    const staffUser = await User.create({ 
      name: 'Staff Operator', 
      email: 'staff@crowdshield.ai', 
      passwordHash, 
      role: 'staff' 
    });

    console.log('Staff user created successfully');
    console.log('Staff Login → email: staff@crowdshield.ai | password: staff123');
    console.log('Staff User ID:', String(staffUser._id));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
