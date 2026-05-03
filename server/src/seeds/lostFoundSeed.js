const dotenv = require('dotenv');
const connectDB = require('../config/db');
const LostFoundItem = require('../models/LostFoundItem');

dotenv.config();
connectDB();

const items = [
  {
    title: 'Black Wallet',
    category: 'Accessories',
    status: 'Lost',
    location: 'Library 2nd Floor',
    date: '2026-04-10',
    description: 'Black leather wallet with student ID card inside.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Student ID Card',
    category: 'ID Cards',
    status: 'Found',
    location: 'Canteen Entrance',
    date: '2026-04-10',
    description: 'Found near the canteen entrance in the afternoon.',
    image: 'https://images.unsplash.com/photo-1586892478025-2b5472316f22?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Scientific Calculator',
    category: 'Electronics',
    status: 'Lost',
    location: 'Lab 03',
    date: '2026-04-09',
    description: 'Gray calculator left after practical session.',
    image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Java Programming Book',
    category: 'Books',
    status: 'Found',
    location: 'Discussion Room',
    date: '2026-04-08',
    description: 'Textbook found on a study table in the discussion room.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
  },
];

const importData = async () => {
  try {
    await LostFoundItem.deleteMany();
    await LostFoundItem.insertMany(items);
    console.log('✅ Lost & Found seed data inserted');
    process.exit();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

importData();