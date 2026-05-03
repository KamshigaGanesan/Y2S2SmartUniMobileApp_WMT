const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservations,
  markArrived
} = require('../controllers/reservationController');

router.post('/', createReservation);
router.get('/', getReservations);
router.patch('/:id/arrived', markArrived);

module.exports = router;