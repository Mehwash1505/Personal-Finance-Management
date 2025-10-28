// File: backend/routes/billRoutes.js
const express = require('express');
const router = express.Router();
const { getBills, addBill } = require('../controllers/billController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getBills).post(protect, addBill);

module.exports = router;