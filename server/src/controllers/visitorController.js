const Visitor = require('../models/Visitor');

// GET visitors with optional filters
const getVisitors = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { personToMeet: { $regex: search, $options: 'i' } },
      ];
    }

    const visitors = await Visitor.find(filter).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visitors' });
  }
};

// POST new visitor
const createVisitor = async (req, res) => {
  try {
    const {
      fullName,
      nic,
      purpose,
      personToMeet,
      department,
      checkInDate,
      checkInTime,
      phoneNumber,
      status,
    } = req.body;

    const newVisitor = new Visitor({
      fullName,
      nic,
      purpose,
      personToMeet,
      department,
      checkInDate,
      checkInTime,
      phoneNumber,
      status,
    });

    const savedVisitor = await newVisitor.save();
    res.status(201).json(savedVisitor);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create visitor',
      error: error.message,
    });
  }
};

// PATCH check out visitor
const checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    visitor.status = 'Checked Out';
    const updatedVisitor = await visitor.save();

    res.json(updatedVisitor);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to check out visitor',
      error: error.message,
    });
  }
};

module.exports = {
  getVisitors,
  createVisitor,
  checkOutVisitor,
};