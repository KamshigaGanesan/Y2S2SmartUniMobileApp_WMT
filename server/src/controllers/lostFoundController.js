const LostFoundItem = require('../models/LostFoundItem');

// GET items with filters
const getLostFoundItems = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await LostFoundItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lost and found items' });
  }
};

// POST new item
const createLostFoundItem = async (req, res) => {
  try {
    const { title, category, status, location, date, description, image, contactName, contactPhone, } = req.body;

    const newItem = new LostFoundItem({
      title,
      category,
      status,
      location,
      date,
      description,
      image,
      contactName, 
      contactPhone,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create lost and found item',
      error: error.message,
    });
  }
};

// PATCH mark as claimed
const markAsClaimed = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = 'Claimed';
    const updatedItem = await item.save();

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update item status',
      error: error.message,
    });
  }
};

module.exports = {
  getLostFoundItems,
  createLostFoundItem,
  markAsClaimed,
};