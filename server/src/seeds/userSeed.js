const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();
connectDB();

const seedUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('user123', 10);

    await User.deleteMany({ email: 'user@smartcampus.com' });

    await User.create({
      name: 'Normal User',
      email: 'user@smartcampus.com',
      password: hashedPassword,
      role: 'user',
    });

    console.log('✅ Normal user created');
    process.exit();
  } catch (error) {
    console.error('❌ User seed failed:', error.message);
    process.exit(1);
  }
};

seedUser();