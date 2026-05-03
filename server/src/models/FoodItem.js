const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Snacks'],
      required: true,
    },
    canteenId: {
      type: String,
      enum: ['Main', 'Eagle'],
      default: 'Main',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);