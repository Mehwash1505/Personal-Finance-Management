// File: backend/controllers/billController.js
const Bill = require('../models/Bill.js');

// @desc    Get all bills for a user
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  const bills = await Bill.find({ user: req.user.id }).sort({ dueDate: 1 });
  res.status(200).json(bills);
};

// @desc    Add a new bill
// @route   POST /api/bills
// @access  Private
const addBill = async (req, res) => {
  const { name, amount, dueDate, isRecurring, category } = req.body;
  const bill = await Bill.create({
    user: req.user.id,
    name,
    amount,
    dueDate,
    isRecurring,
    category,
  });
  res.status(201).json(bill);
};

module.exports = { getBills, addBill };