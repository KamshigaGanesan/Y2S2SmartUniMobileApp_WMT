const FoodItem = require('../models/FoodItem');

// GET food items with filters
const getFoodItems = async (req, res) => {
  try {
    const { category, search, availability, canteenId } = req.query;
    const filter = {};

    if (canteenId) {
      filter.canteenId = canteenId;
    }

    if (category) {
      filter.category = category;
    }

    if (availability) {
      filter.availability = availability;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await FoodItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch food items' });
  }
};

// POST new food item
const createFoodItem = async (req, res) => {
  try {
    const { name, category, price, description, image, availability, canteenId } = req.body;

    const newItem = new FoodItem({
      name,
      category,
      price,
      description,
      image,
      availability,
      canteenId: canteenId || 'Main',
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create food item',
      error: error.message,
    });
  }
};

module.exports = {
  getFoodItems,
  createFoodItem,
};