const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  fullName: String,
  nic: String,
  phoneNumber: String,
  purpose: String,
  personToMeet: String,
  visitDate: String,
  visitTime: String,
  status: {
    type: String,
    default: 'pending', // pending | arrived | cancelled
  },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);