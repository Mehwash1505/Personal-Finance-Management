// File: backend/routes/budgetRoutes.js

const express = require('express');
const router = express.Router();
const { getBudgets, setBudget } = require('../controllers/budgetController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getBudgets).post(protect, setBudget);

module.exports = router;