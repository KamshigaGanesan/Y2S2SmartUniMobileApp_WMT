const Announcement = require('../models/Announcement');

// GET announcements with optional filters
const getAnnouncements = async (req, res) => {
  try {
    const { category, priority, search } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

// POST new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, category, date, priority, description } = req.body;

    const newAnnouncement = new Announcement({
      title,
      category,
      date,
      priority,
      description,
    });

    const savedAnnouncement = await newAnnouncement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create announcement',
      error: error.message,
    });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
};