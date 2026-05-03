/* To make the backend safer by allowing only logged-in admins to use admin actions. A simple strong rule: GET routes can stay open for now, POST admin creation routes should require admin, PATCH admin management routes should require admin
const express = require('express');
const router = express.Router();

const {
  getFoodItems,
  createFoodItem,
} = require('../controllers/foodController');

router.get('/', getFoodItems);
router.post('/', createFoodItem);

module.exports = router; */

const express = require('express');
const router = express.Router();

const { getFoodItems, createFoodItem } = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getFoodItems);
router.post('/', protect, adminOnly, createFoodItem);

module.exports = router;