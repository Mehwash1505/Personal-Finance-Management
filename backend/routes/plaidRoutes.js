const express = require('express');
const router = express.Router();
const { createLinkToken } = require('../controllers/plaidController');
const { protect } = require('../middlewares/authMiddleware'); // Import middleware

// Any request to this route must first pass through the 'protect' middleware
router.post('/create_link_token', protect, createLinkToken);

module.exports = router;