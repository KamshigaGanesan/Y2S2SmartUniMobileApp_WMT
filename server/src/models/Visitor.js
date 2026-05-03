const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    nic: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    personToMeet: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Checked In', 'Checked Out'],
      default: 'Checked In',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);