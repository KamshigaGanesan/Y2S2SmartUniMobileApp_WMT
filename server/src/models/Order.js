const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      qty: Number,
      price: Number,
      source: String, // Main / Eagle / External
    },
  ],
  totalAmount: Number,
  totalItems: Number,
  status: {
    type: String,
    default: 'preparing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);