/* To make the backend safer by allowing only logged-in admins to use admin actions. A simple strong rule: GET routes can stay open for now, POST admin creation routes should require admin, PATCH admin management routes should require admin
const express = require('express'); 
const express = require('express');
const router = express.Router();

const { getBooks, createBook } = require('../controllers/bookController');

router.get('/', getBooks);
router.post('/', createBook);

module.exports = router; */

const express = require('express');
const router = express.Router();

const { getBooks, createBook } = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getBooks);
router.post('/', protect, adminOnly, createBook);

module.exports = router;