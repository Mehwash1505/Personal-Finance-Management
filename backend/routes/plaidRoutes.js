const express = require('express');
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken, 
  getTransactions,
  getAccounts,
} = require('../controllers/plaidController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create_link_token', protect, createLinkToken);


router.post('/exchange_public_token', protect, exchangePublicToken);
router.get('/transactions', protect, getTransactions);
router.get('/accounts', protect, getAccounts);

module.exports = router;