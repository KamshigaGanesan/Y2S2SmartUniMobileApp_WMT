const dotenv = require('dotenv');
const connectDB = require('../config/db');
const FoodItem = require('../models/FoodItem');

dotenv.config();
connectDB();

const foodItems = [
  {
    name: 'Chicken Rice',
    category: 'Lunch',
    price: 450,
    description: 'Delicious chicken rice served with curry and salad.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    availability: 'Available',
  },
  {
    name: 'Veg Fried Rice',
    category: 'Lunch',
    price: 350,
    description: 'Vegetable fried rice with fresh mixed vegetables.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    availability: 'Available',
  },
  {
    name: 'Egg Roti',
    category: 'Breakfast',
    price: 120,
    description: 'Freshly made egg roti, hot and tasty.',
    image: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=900&q=80',
    availability: 'Available',
  },
  {
    name: 'Milk Tea',
    category: 'Beverages',
    price: 80,
    description: 'Hot milk tea prepared fresh for students.',
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80',
    availability: 'Available',
  },
  {
    name: 'Iced Coffee',
    category: 'Beverages',
    price: 200,
    description: 'Cold iced coffee for a refreshing break.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
    availability: 'Unavailable',
  },
  {
    name: 'Chicken Burger',
    category: 'Snacks',
    price: 300,
    description: 'Soft bun with crispy chicken patty and sauce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    availability: 'Available',
  },
];

const importData = async () => {
  try {
    await FoodItem.deleteMany();
    await FoodItem.insertMany(foodItems);
    console.log('✅ Canteen seed data inserted');
    process.exit();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

importData();