const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    faculty: {
      type: String,
      enum: ['Computing', 'Business'],
      required: true,
    },

    category: {
      type: String,
      default: 'General',
    },

    description: {
      type: String,
    },

    image: {
      type: String,
    },

    availability: {
      type: String,
      enum: ['Available', 'Borrowed'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);