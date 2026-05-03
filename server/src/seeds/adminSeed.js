const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.deleteMany({ email: 'admin@smartcampus.com' });

    await User.create({
      name: 'Admin User',
      email: 'admin@smartcampus.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin user created');
    process.exit();
  } catch (error) {
    console.error('❌ Admin seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();