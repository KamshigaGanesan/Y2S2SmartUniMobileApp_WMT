/* To make the backend safer by allowing only logged-in admins to use admin actions. A simple strong rule: GET routes can stay open for now, POST admin creation routes should require admin, PATCH admin management routes should require admin
const express = require('express');
const router = express.Router();

const {
  getVisitors,
  createVisitor,
  checkOutVisitor,
} = require('../controllers/visitorController');

router.get('/', getVisitors);
router.post('/', createVisitor);
router.patch('/:id/checkout', checkOutVisitor);

module.exports = router;*/

const express = require('express');
const router = express.Router();

const {
  getVisitors,
  createVisitor,
  checkOutVisitor,
} = require('../controllers/visitorController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getVisitors);
router.post('/', createVisitor); // public form submission
router.patch('/:id/checkout', protect, adminOnly, checkOutVisitor); // admin only

module.exports = router;