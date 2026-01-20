const Goal = require('../models/Goal.js');

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private 
const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user.id });
  res.status(200).json(goals);
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  const { name, targetAmount, deadline } = req.body;
  const goal = await Goal.create({
    user: req.user.id,
    name,
    targetAmount,
    deadline,
  });
  res.status(201).json(goal);
};

// @desc    Update a goal (e.g., add to savings)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    if (goal.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedGoal);
};

module.exports = { getGoals, createGoal, updateGoal };
