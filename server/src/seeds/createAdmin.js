const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/smart_campus_db");

    console.log('MongoDB connected');

    const email = 'admin@smartcampus.com';
    const existingAdmin = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (existingAdmin) {
      existingAdmin.name = 'Admin';
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      await existingAdmin.save();

      console.log('Existing admin updated successfully');
    } else {
      await User.create({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('Admin created successfully');
    }

    console.log('Login with: admin@smartcampus.com / admin123');
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();