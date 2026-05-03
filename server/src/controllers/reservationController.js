const Reservation = require('../models/Reservation');

// CREATE
exports.createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    const saved = await reservation.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: 'Failed to create reservation' });
  }
};

// GET ALL
exports.getReservations = async (req, res) => {
  const data = await Reservation.find().sort({ createdAt: -1 });
  res.json(data);
};

// MARK ARRIVED
exports.markArrived = async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status: 'arrived' },
    { new: true }
  );
  res.json(updated);
};