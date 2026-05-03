const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Electronics', 'ID Cards', 'Accessories', 'Books', 'Other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Lost', 'Found', 'Claimed'],
      required: true,
      default: 'Lost',
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: String,
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
    contactName: {
      type: String,
      default:'',
    },
    contactPhone : {
      type: String,
      default:'',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostFoundItem', lostFoundItemSchema);