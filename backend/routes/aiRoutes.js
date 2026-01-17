const express = require('express');
const router = express.Router();
const { askAiAdvisor } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/ask', protect, askAiAdvisor);

module.exports = router; 
