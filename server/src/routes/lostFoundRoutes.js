/* To make the backend safer by allowing only logged-in admins to use admin actions. A simple strong rule: GET routes can stay open for now, POST admin creation routes should require admin, PATCH admin management routes should require admin
const express = require('express');
const router = express.Router();

const {
  getLostFoundItems,
  createLostFoundItem,
  markAsClaimed,
} = require('../controllers/lostFoundController');

router.get('/', getLostFoundItems);
router.post('/', createLostFoundItem);
router.patch('/:id/claim', markAsClaimed);

module.exports = router;*/

const express = require('express');
const router = express.Router();

const {
  getLostFoundItems,
  createLostFoundItem,
  markAsClaimed,
} = require('../controllers/lostFoundController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getLostFoundItems);
router.post('/', createLostFoundItem); // public form submission
router.patch('/:id/claim', protect, adminOnly, markAsClaimed); // admin only

module.exports = router;