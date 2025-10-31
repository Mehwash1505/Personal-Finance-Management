const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, exportTransactions } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/export').get(protect, exportTransactions); // <-- Ensure this line is present

module.exports = router;