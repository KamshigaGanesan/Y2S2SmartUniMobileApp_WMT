const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    // Title of the announcement
    title: {
      type: String,
      required: true,
    },

    // Category (must match your frontend types)
    category: {
      type: String,
      enum: [
        'Academic',
        'Events',
        'Exams',
        'Library',
        'Canteen',
        'Administration',
      ],
      required: true,
    },

    // Date as string (you used string in UI)
    date: {
      type: String,
      required: true,
    },

    // Priority badge
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Normal'],
      default: 'Normal',
    },

    // Description text
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // optional but useful
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);