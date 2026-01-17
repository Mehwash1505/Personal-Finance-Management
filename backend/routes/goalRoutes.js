const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal } = require('../controllers/goalController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getGoals).post(protect, createGoal);
router.route('/:id').put(protect, updateGoal);

module.exports = router; 
