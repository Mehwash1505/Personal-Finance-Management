const express = require('express');
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken, // Import new functions
  getTransactions,
} = require('../controllers/plaidController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create_link_token', protect, createLinkToken);

// --- ADD THE TWO NEW ROUTES BELOW ---
router.post('/exchange_public_token', protect, exchangePublicToken);
router.get('/transactions', protect, getTransactions);

module.exports = router;