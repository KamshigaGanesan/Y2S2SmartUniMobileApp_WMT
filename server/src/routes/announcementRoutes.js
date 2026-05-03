/* To make the backend safer by allowing only logged-in admins to use admin actions. A simple strong rule: GET routes can stay open for now, POST admin creation routes should require admin, PATCH admin management routes should require admin
const express = require('express');
const router = express.Router();

const {
  getAnnouncements,
  createAnnouncement,
} = require('../controllers/announcementController');

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);

module.exports = router;*/

const express = require('express');
const router = express.Router();

const {
  getAnnouncements,
  createAnnouncement,
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.post('/', protect, adminOnly, createAnnouncement);

module.exports = router;