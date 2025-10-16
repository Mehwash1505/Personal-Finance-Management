// File: backend/controllers/budgetController.js

const User = require('../models/User.js');

// @desc    Get user's budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set or update a budget for a category
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
  const { category, limit } = req.body;
  if (!category || !limit) {
    return res.status(400).json({ message: 'Please provide category and limit' });
  }

  try {
    const user = await User.findById(req.user.id);
    const budgetIndex = user.budgets.findIndex((b) => b.category === category);

    if (budgetIndex > -1) {
      // Update existing budget
      user.budgets[budgetIndex].limit = limit;
    } else {
      // Add new budget
      user.budgets.push({ category, limit });
    }

    await user.save();
    res.status(200).json(user.budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getBudgets,
  setBudget,
};